// Import the real Timer file directly. Importing from "three" would loop
// back through the alias in next.config.ts.
import { Timer } from "../../node_modules/three/src/core/Timer.js";

/**
 * Clock-shaped wrapper around THREE.Timer.
 *
 * React Three Fiber 9 still does `new THREE.Clock()`. Three r183 prints a
 * deprecation warning from that constructor. This class is what the `three`
 * import resolves to instead. It keeps the methods R3F calls: start, stop,
 * getDelta, getElapsedTime, plus the writable elapsedTime and oldTime fields
 * used when frameloop is "never".
 */
export class Clock {
  autoStart: boolean;
  startTime = 0;
  oldTime = 0;
  elapsedTime = 0;
  running = false;
  private timer = new Timer();

  constructor(autoStart = true) {
    this.autoStart = autoStart;
  }

  start(): void {
    this.timer.dispose();
    this.timer = new Timer();
    if (typeof document !== "undefined") this.timer.connect(document);
    this.startTime = performance.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop(): void {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }

  getElapsedTime(): number {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta(): number {
    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }
    if (!this.running) return 0;

    this.timer.update();
    const diff = this.timer.getDelta();
    this.oldTime = performance.now();
    this.elapsedTime += diff;
    return diff;
  }
}
