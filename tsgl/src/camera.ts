import { Matrix, Vector } from "./matrix";

/**
 * The scene camera.
 */
class Camera {
  public position: Vector;
  public azimuth: number;
  public elevation: number;

  public fov: number;
  public aspect: number;

  public fogDensity: number;
  public fogColor: Vector;

  public background: Vector;

  /**
   * Creates a new camera.
   * 
   * @param aspect The camera aspect ratio.
   * @param fov The camera field of view.
   */
  constructor(aspect: number, fov: number) {
    this.aspect = aspect;
    this.fov = fov;

    this.position = new Vector(3, 3, 3);
    this.azimuth = 3 * Math.PI / 4;
    this.elevation = - Math.PI / 4;

    this.fogDensity = 0;
    this.fogColor = new Vector(1, 1, 1);

    this.background = new Vector(1, 1, 1);
  }

  /**
   * Rotates the camera to look at the target.
   * 
   * @param position The position vector of the target.
   */
  public lookAt(position: Vector) {
    let direction = position.sub(this.position).normalize();
    this.azimuth = Math.atan2(-direction.z, direction.x);
    this.elevation = Math.asin(direction.y);
  }

  /**
   * Returns a vector in the direction the camera is facing.
   * 
   * **Note:** the view matrix direction vector is the opposite of this due to WebGL's coordinate system.
   * 
   * @returns The direction vector.
   */
  public getDirection(): Vector {
    return new Vector(
      Math.cos(this.azimuth) * Math.cos(this.elevation),
      Math.sin(this.elevation),
      -Math.sin(this.azimuth) * Math.cos(this.elevation)
    ).normalize();
  }

  /**
   * Returns a vector in the right direction relative to the camera.
   * 
   * @returns The right vector.
   */
  public getRight(): Vector {
    return new Vector(0, 1, 0).cross(this.getDirection().scale(-1)).normalize();
  }

  /**
   * Returns a vector in the up direction relative to the camera.
   * 
   * @returns The up vector.
   */
  public getUp(): Vector {
    return this.getDirection().scale(-1).cross(this.getRight()).normalize();
  }

  /**
   * Calculate the view matrix for the camera, given its position and rotation.
   * 
   * @returns The view matrix.
   */
  public getViewMatrix(): Matrix {
    let c = this.position;

    let u = this.getUp();
    let v = this.getDirection().scale(-1);
    let r = this.getRight();

    return Matrix.squareFromArray([
      r.x, r.y, r.z, -c.dot(r),
      u.x, u.y, u.z, -c.dot(u),
      v.x, v.y, v.z, -c.dot(v),
      0, 0, 0, 1
    ]);
  }

  /**
   * Calculates the projection matrix for the camera, given its aspect ratio and field of view.
   * 
   * Uses the matrix from [here](https://terathon.com/gdc07_lengyel.pdf).
   * 
   * @returns The projection matrix.
   */
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
}

export default Camera;