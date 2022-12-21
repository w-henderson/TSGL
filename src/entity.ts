import { Matrix, Vector } from "./matrix";

import Mesh from "./webgl/mesh";
import WebGLEntity from "./webgl/entity";
import Camera from "./camera";

class Entity extends WebGLEntity {
  private _position: Vector;
  private _rotation: Vector;
  private _scale: Vector;

  private scaleMatrix: Matrix;
  private transformation: Matrix;

  private children: Entity[];

  constructor(mesh: Mesh) {
    super(mesh);

    this._position = new Vector(0, 0, 0);
    this._rotation = new Vector(0, 0, 0);
    this._scale = new Vector(1, 1, 1);
    this.scaleMatrix = Matrix.identity();
    this.transformation = Matrix.identity();

    this.children = [];
  }

  public translate(vector: Vector) {
    this.position = this.position.add(vector);
  }

  public rotate(vector: Vector) {
    this.rotation = this.rotation.add(vector);
  }

  public addChild(...children: Entity[]) {
    this.children.push(...children);
  }

  private recalculateModel() {
    this.model = Matrix.translate(this.position)
      .mul(Matrix.rotateX(this.rotation.x))
      .mul(Matrix.rotateY(this.rotation.y))
      .mul(Matrix.rotateZ(this.rotation.z));
  }

  private recalculateScale() {
    this.scaleMatrix = Matrix.scale(this.scale);
  }

  private recalculateTransformation() {
    this.transformation = this.model.mul(this.scaleMatrix);
  }

  get position(): Vector {
    return this._position;
  }

  get rotation(): Vector {
    return this._rotation;
  }

  get scale(): Vector {
    return this._scale;
  }

  set position(value: Vector) {
    this._position = value;
    this.recalculateModel();
    this.recalculateTransformation();
  }

  set rotation(value: Vector) {
    this._rotation = value;
    this.recalculateModel();
    this.recalculateTransformation();
  }

  set scale(value: Vector) {
    this._scale = value;
    this.recalculateScale();
    this.recalculateTransformation();
  }

  render(camera: Camera) {
    this.renderGraph(camera, Matrix.identity());
  }

  renderGraph(camera: Camera, parent: Matrix) {
    this.mesh.render(camera, parent.mul(this.transformation), this.shader);

    for (let child of this.children) {
      child.renderGraph(camera, parent.mul(this.model));
    }
  }
}

export default Entity;