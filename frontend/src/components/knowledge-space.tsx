"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { GraphEdge, GraphNode } from "@/lib/api";
import { useSpaceStore } from "@/store/space-store";

const REGION_ANCHORS: Record<string, [number, number, number]> = {
  experience: [-7, 2, 0],
  projects: [6, 1.5, -1],
  music: [0, -4, 3],
  about: [0, 5, -4],
};

const MIDNIGHT = "#1A1A30";
const TEAL = "#00CED1";
const MAGENTA = "#FF1493";
const CORAL = "#FF7F50";
const ORCHID = "#9932CC";
const MINT = "#F5FFFA";

const KIND_COLOR: Record<string, string> = {
  Person: CORAL,
  Organization: TEAL,
  Role: ORCHID,
  Project: MAGENTA,
  Tech: TEAL,
  Domain: ORCHID,
  Media: CORAL,
  Document: MAGENTA,
};

function hashOffset(id: string): [number, number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const a = ((h & 255) / 255 - 0.5) * 3.2;
  const b = (((h >> 8) & 255) / 255 - 0.5) * 2.4;
  const c = (((h >> 16) & 255) / 255 - 0.5) * 3.2;
  return [a, b, c];
}

function nodePosition(node: GraphNode): [number, number, number] {
  const anchor = REGION_ANCHORS[node.region] ?? [0, 0, 0];
  const [ox, oy, oz] = hashOffset(node.id);
  return [anchor[0] + ox, anchor[1] + oy, anchor[2] + oz];
}

function Totem({
  node,
  position,
  selected,
  highlighted,
  dimmed,
  onSelect,
}: {
  node: GraphNode;
  position: [number, number, number];
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const kindColor = KIND_COLOR[node.kind] ?? TEAL;
  const lit = selected || highlighted;
  const color = lit ? MINT : kindColor;
  const scale = lit ? 1.25 : 1;
  const opacity = dimmed ? 0.22 : 0.95;

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
      <group position={position} scale={scale}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {node.kind === "Project" ? (
            <boxGeometry args={[0.55, 0.55, 0.55]} />
          ) : node.kind === "Media" ? (
            <torusGeometry args={[0.28, 0.12, 12, 24]} />
          ) : node.kind === "Tech" ? (
            <octahedronGeometry args={[0.34, 0]} />
          ) : (
            <sphereGeometry args={[0.32, 24, 24]} />
          )}
          <meshStandardMaterial
            color={color}
            emissive={lit ? MINT : "#000000"}
            emissiveIntensity={selected ? 0.45 : highlighted ? 0.28 : 0.05}
            transparent
            opacity={opacity}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>
        <Html distanceFactor={10} position={[0, 0.55, 0]} center>
          <button
            type="button"
            onClick={onSelect}
            className="pointer-events-auto rounded-md bg-[#1A1A30]/70 px-2 py-0.5 text-[11px] tracking-wide backdrop-blur-sm"
            style={{ opacity: dimmed ? 0.35 : 1, color: lit ? MINT : "#e7e4f2" }}
          >
            <span className="mr-1">{node.emoji ?? "•"}</span>
            {node.label}
          </button>
        </Html>
      </group>
    </Float>
  );
}

function EdgeLines({
  nodes,
  edges,
  positions,
  highlightEdgeIds,
  dimmed,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Map<string, [number, number, number]>;
  highlightEdgeIds: string[];
  dimmed: boolean;
}) {
  const highlight = new Set(highlightEdgeIds);
  return (
    <>
      {edges.map((edge) => {
        const a = positions.get(edge.source);
        const b = positions.get(edge.target);
        if (!a || !b) return null;
        const active = highlight.has(edge.id);
        return (
          <Line
            key={edge.id}
            points={[a, b]}
            color={MINT}
            lineWidth={active ? 2 : 1}
            transparent
            opacity={dimmed && !active ? 0.16 : active ? 0.95 : 0.72}
          />
        );
      })}
    </>
  );
}

const HOME_TARGET = new THREE.Vector3(0, 0, 0);
const HOME_CAMERA = new THREE.Vector3(0, 4, 16);

type OrbitControlsHandle = {
  target: THREE.Vector3;
  position0: THREE.Vector3;
  target0: THREE.Vector3;
  update: () => void;
  addEventListener: (type: "start", listener: () => void) => void;
  removeEventListener: (type: "start", listener: () => void) => void;
};

function CameraRig() {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as unknown as
    | OrbitControlsHandle
    | null
    | undefined;
  const focusNodeIds = useSpaceStore((s) => s.focusNodeIds);
  const focusRegion = useSpaceStore((s) => s.focusRegion);
  const graph = useSpaceStore((s) => s.graph);
  const viewResetId = useSpaceStore((s) => s.viewResetId);
  const target = useRef(HOME_TARGET.clone());
  const camGoal = useRef(HOME_CAMERA.clone());
  const flying = useRef(false);

  const beginFly = (lookAt: THREE.Vector3, position: THREE.Vector3) => {
    target.current.copy(lookAt);
    camGoal.current.copy(position);
    flying.current = true;
  };

  useEffect(() => {
    if (!controls) return;
    const release = () => {
      flying.current = false;
    };
    controls.addEventListener("start", release);
    return () => controls.removeEventListener("start", release);
  }, [controls]);

  useEffect(() => {
    if (!viewResetId) return;
    const lookAt = controls?.target0 ?? HOME_TARGET;
    const position = controls?.position0 ?? HOME_CAMERA;
    beginFly(lookAt, position);
  }, [viewResetId, controls]);

  useEffect(() => {
    if (!graph) return;
    const positions = new Map(
      graph.nodes.map((n) => [n.id, nodePosition(n)] as const),
    );
    if (focusNodeIds.length) {
      const acc = new THREE.Vector3();
      let count = 0;
      for (const id of focusNodeIds) {
        const p = positions.get(id);
        if (!p) continue;
        acc.add(new THREE.Vector3(...p));
        count += 1;
      }
      if (count) {
        acc.multiplyScalar(1 / count);
        beginFly(acc, new THREE.Vector3(acc.x + 4, acc.y + 3, acc.z + 9));
        return;
      }
    }
    if (focusRegion && REGION_ANCHORS[focusRegion]) {
      const [x, y, z] = REGION_ANCHORS[focusRegion];
      beginFly(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x + 5, y + 3, z + 10),
      );
    }
  }, [focusNodeIds, focusRegion, graph]);

  useFrame((_, dt) => {
    if (!flying.current) return;
    const alpha = Math.min(1, dt * 1.6);
    camera.position.lerp(camGoal.current, alpha);
    if (controls?.target) {
      controls.target.lerp(target.current, alpha);
      controls.update();
    }
    const arrived =
      camera.position.distanceTo(camGoal.current) < 0.05 &&
      (!controls?.target || controls.target.distanceTo(target.current) < 0.05);
    if (arrived) flying.current = false;
  });

  return null;
}

function SceneContents() {
  const graph = useSpaceStore((s) => s.graph);
  const selectedIds = useSpaceStore((s) => s.selectedIds);
  const highlightNodeIds = useSpaceStore((s) => s.highlightNodeIds);
  const highlightEdgeIds = useSpaceStore((s) => s.highlightEdgeIds);
  const toggleSelect = useSpaceStore((s) => s.toggleSelect);

  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    if (!graph) return map;
    for (const n of graph.nodes) map.set(n.id, nodePosition(n));
    return map;
  }, [graph]);

  if (!graph) return null;

  const hasHighlight = highlightNodeIds.length > 0;
  const highlightSet = new Set(highlightNodeIds);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 12, 6]} intensity={1.05} color="#f2f3f8" />
      <directionalLight position={[-6, -4, -8]} intensity={0.45} color={TEAL} />
      <directionalLight position={[4, -2, -10]} intensity={0.2} color={MAGENTA} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]}>
        <circleGeometry args={[28, 64]} />
        <meshStandardMaterial color="#121228" transparent opacity={0.55} />
      </mesh>
      <EdgeLines
        nodes={graph.nodes}
        edges={graph.edges}
        positions={positions}
        highlightEdgeIds={highlightEdgeIds}
        dimmed={hasHighlight}
      />
      {graph.nodes.map((node) => {
        const pos = positions.get(node.id)!;
        const selected = selectedIds.includes(node.id);
        const highlighted = highlightSet.has(node.id);
        return (
          <Totem
            key={node.id}
            node={node}
            position={pos}
            selected={selected}
            highlighted={highlighted}
            dimmed={hasHighlight && !highlighted && !selected}
            onSelect={() => toggleSelect(node.id)}
          />
        );
      })}
      <CameraRig />
      <OrbitControls makeDefault enablePan enableZoom enableRotate minDistance={4} maxDistance={40} />
    </>
  );
}

export function KnowledgeSpace() {
  return (
    <div className="absolute inset-0 isolate">
      <Canvas
        camera={{ position: [0, 4, 16], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={[MIDNIGHT, 18, 42]} />
        <SceneContents />
      </Canvas>
    </div>
  );
}
