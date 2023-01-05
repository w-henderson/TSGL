import { Vector } from "tsgl/matrix";

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpVector(a: Vector, b: Vector, t: number) {
  return new Vector(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t),
    lerp(a.z, b.z, t)
  );
}