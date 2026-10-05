// Same module as the "three" package, with Clock replaced by the Timer wrapper.
// The local Clock export shadows the one from the bundle.
export * from "../../node_modules/three/build/three.module.js";
export { Clock } from "./timer-clock";
