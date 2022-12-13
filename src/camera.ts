import { Matrix, Vector } from "./matrix";

class Camera {
  public position: Vector;
  public azimuth: number;
  public elevation: number;

  private fov: number;
  private aspect: number;

  constructor(aspect: number, fov: number) {
    this.aspect = aspect;
    this.fov = fov;

    this.position = new Vector(3, 3, 3);
    this.azimuth = 3 * Math.PI / 4;
    this.elevation = - Math.PI / 4;
  }

  public getDirection(): Vector {
    return new Vector(
      Math.cos(this.azimuth) * Math.cos(this.elevation),
      Math.sin(this.elevation),
      -Math.sin(this.azimuth) * Math.cos(this.elevation)
    ).scale(-1).normalize();
  }

  public getRight(): Vector {
    return new Vector(0, 1, 0).cross(this.getDirection()).normalize();
  }

  public getUp(): Vector {
    return this.getDirection().cross(this.getRight()).normalize();
  }

  public getViewMatrix(): Matrix {
    let c = this.position;

    let u = this.getUp();
    let v = this.getDirection();
    let r = this.getRight();

    return Matrix.squareFromArray([
      r.x, r.y, r.z, -c.dot(r),
      u.x, u.y, u.z, -c.dot(u),
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
    return this.position;
  }
}

export default Camera;