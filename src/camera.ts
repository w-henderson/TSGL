import { Matrix, Vector } from "./matrix";

class Camera {
  private azimuth: number;
  private elevation: number;
  private distance: number;

  private fov: number;
  private aspect: number;

  constructor(aspect: number, fov: number) {
    this.aspect = aspect;
    this.fov = fov;

    this.azimuth = Math.PI / 4;
    this.elevation = Math.PI / 4;
    this.distance = 8;
  }

  public getViewMatrix(): Matrix {
    let c = this.getPosition();
    let l = new Vector(0, 0, 0);
    let u = new Vector(0, 1, 0);

    let v = c.sub(l).normalize();
    let r = v.cross(u).normalize();
    let u2 = v.cross(r).normalize();

    return Matrix.squareFromArray([
      r.x, r.y, r.z, -c.dot(r),
      u2.x, u2.y, u2.z, -c.dot(u2),
      v.x, v.y, v.z, -c.dot(v),
      0, 0, 0, 1
    ]);
  }

  // https://terathon.com/gdc07_lengyel.pdf
  public getProjectionMatrix(): Matrix {
    let n = 0.01;  // near plane
    let f = 10000; // far plane
    let a = this.aspect;
    let e = 1 / Math.tan(this.fov / 2);

    return Matrix.squareFromArray([
      e, 0, 0, 0,
      0, e / a, 0, 0,
      0, 0, -(f + n) / (f - n), -2 * f * n / (f - n),
      0, 0, -1, 0
    ]);
  }

  public getPosition(): Vector {
    return new Vector(
      this.distance * Math.cos(this.elevation) * Math.sin(this.azimuth),
      this.distance * Math.sin(this.elevation),
      this.distance * Math.cos(this.elevation) * Math.cos(this.azimuth)
    );
  }
}

export default Camera;