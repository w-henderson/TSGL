import TSGL from ".";

import { Matrix, Vector } from "./matrix";

import Mesh from "./webgl/mesh";
import WebGLEntity from "./webgl/entity";
import Camera from "./camera";
import Component, { ComponentContext } from "./component";
import Obj from "./obj/obj";
import Empty from "./webgl/empty";
import Light from "./light";

class Entity extends WebGLEntity {
  private static _id = 0;
  public readonly name: string;

  private _position: Vector;
  private _rotation: Vector;
  private _scale: Vector;

  private scaleMatrix: Matrix;
  private transformation: Matrix;

  private children: Entity[];

  private components: Map<string, Component>;

  constructor(mesh: Mesh, name?: string) {
    super(mesh);

    this.name = name || `Entity${Entity._id++}`;

    this._position = new Vector(0, 0, 0);
    this._rotation = new Vector(0, 0, 0);
    this._scale = new Vector(1, 1, 1);
    this.scaleMatrix = Matrix.identity();
    this.transformation = Matrix.identity();

    this.children = [];
    this.components = new Map();
  }

  public addChild(...children: Entity[]): Entity {
    this.children.push(...children);
    return this;
  }

  public removeChild(...children: Entity[]): Entity {
    for (let child of children) {
      let index = this.children.indexOf(child);
      if (index !== -1) this.children.splice(index, 1);
    }
    return this;
  }

  public addComponent(...components: Component[]): Entity {
    for (let component of components) {
      this.components.set(component.constructor.name, component);
    }
    return this;
  }

  public getComponent<T extends Component>(c: new (...args: any[]) => T): T | undefined {
    return this.components.get(c.name) as T;
  }

  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  public getChild(name: string): Entity | undefined {
    return this.children.find((child) => child.name === name);
  }

  public getChildren(): Entity[] {
    return this.children;
  }

  public find(name: string): Entity | undefined {
    if (this.name === name) return this;

    for (let child of this.children) {
      let result = child.find(name);
      if (result) return result;
    }

    return undefined;
  }

  public invokeComponentMethod(method: keyof Component, ctx: ComponentContext) {
    for (let child of this.children) {
      child.invokeComponentMethod(method, {
        tsgl: ctx.tsgl,
        entity: child
      });
    }

    for (let component of this.components.values()) {
      if (component[method]) component[method]!(ctx);
    }
  }

  public static async loadObj(name: string, source: string): Promise<Entity> {
    let object = await Obj.parse(source);
    let meshes = object.getMeshes();
    let entities = meshes.map((mesh, i) => new Entity(mesh, `${name}_${i}`));

    return new Entity(new Empty(), name).addChild(...entities);
  }

  public translate(vector: Vector) {
    this.position = this.position.add(vector);
  }

  public rotate(vector: Vector) {
    this.rotation = this.rotation.add(vector);
  }

  public forward(): Vector {
    // return a vector in the -z direction

    return new Vector(
      Math.sin(this.rotation.y),
      0,
      -Math.cos(this.rotation.y)
    );
  }

  public right(): Vector {
    // return a vector in the -x direction

    return new Vector(
      -Math.cos(this.rotation.y),
      0,
      -Math.sin(this.rotation.y)
    );
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

  public get position(): Vector {
    return this._position;
  }

  public get rotation(): Vector {
    return this._rotation;
  }

  public get scale(): Vector {
    return this._scale;
  }

  public set position(value: Vector) {
    this._position = value;
    this.recalculateModel();
    this.recalculateTransformation();
  }

  public set rotation(value: Vector) {
    this._rotation = value;
    this.recalculateModel();
    this.recalculateTransformation();
  }

  public set scale(value: Vector) {
    this._scale = value;
    this.recalculateScale();
    this.recalculateTransformation();
  }

  public render(tsgl: TSGL) {
    this.shader.useProgram();
    tsgl.camera.getPosition().uploadToShader(this.shader, "wc_camera_position");
    Light.uploadToShader(tsgl.lights, this.shader.getHandle()!);

    this.renderGraph(tsgl.camera, Matrix.identity());
  }

  private renderGraph(camera: Camera, parent: Matrix) {
    this.mesh.render(camera, parent.mul(this.transformation), this.shader);

    for (let child of this.children) {
      child.renderGraph(camera, parent.mul(this.model));
    }
  }
}

export default Entity;