import TSGL from ".";

import { Matrix, Vector } from "./matrix";

import Mesh from "./webgl/mesh";
import ShaderProgram from "./webgl/program";

import Component, { ComponentContext } from "./component";
import Obj from "./obj/obj";
import MeshComponent from "./mesh";

/**
 * An entity.
 */
class Entity {
  private static _id = 0;
  public readonly name: string;

  private _position: Vector;
  private _rotation: Vector;
  private _scale: Vector;

  private modelMatrix: Matrix;
  private scaleMatrix: Matrix;
  private transformation: Matrix;

  private children: Entity[];

  private components: Map<string, Component>;

  /**
   * Creates a new entity with no components or children at the origin.
   * 
   * @param name The name of the entity, defaults to "Entity" + the number of entities created.
   */
  constructor(name?: string) {
    this.name = name || `Entity${Entity._id++}`;

    this._position = new Vector(0, 0, 0);
    this._rotation = new Vector(0, 0, 0);
    this._scale = new Vector(1, 1, 1);
    this.modelMatrix = Matrix.identity();
    this.scaleMatrix = Matrix.identity();
    this.transformation = Matrix.identity();

    this.children = [];
    this.components = new Map();
  }

  /**
   * Creates a new entity from an object file.
   * 
   * @param name The name of the entity.
   * @param source The URL to load the OBJ file from.
   * @returns A promise that resolves to the loaded entity.
   */
  public static async loadObj(name: string, source: string): Promise<Entity> {
    let object = await Obj.parse(source);
    let meshes = object.getMeshes();

    return new Entity(name).addComponent(new MeshComponent(meshes));
  }

  /**
   * Creates a new entity with the given mesh.
   * 
   * @param mesh The mesh to assign to the entity.
   * @param name The name of the entity.
   * @returns The new entity.
   */
  public static withMesh(mesh: Mesh, name?: string): Entity {
    return new Entity(name).addComponent(new MeshComponent([mesh]));
  }

  /**
   * Creates a new entity with the given meshes.
   * 
   * @param meshes The meshes to assign to the entity.
   * @param name The name of the entity.
   * @returns The new entity.
   */
  public static withMeshes(meshes: Mesh[], name?: string): Entity {
    return new Entity(name).addComponent(new MeshComponent(meshes));
  }

  /**
   * Creates a new entity with the given type of mesh.
   * 
   * @param c The constructor of the mesh to assign to the entity.
   * @param name The name of the entity.
   * @returns The new entity.
   */
  public static withMeshType<T extends Mesh>(c: new () => T, name?: string): Entity {
    return Entity.withMesh(new c(), name);
  }

  /**
   * Adds one or multiple children to the entity.
   * 
   * @param children The child(ren) to add to the entity.
   * @returns The entity for chaining.
   */
  public addChild(...children: Entity[]): Entity {
    this.children.push(...children);
    return this;
  }

  /**
   * Removes one or more children from the entity.
   * 
   * @param children The child(ren) to remove from the entity.
   * @returns The entity for chaining.
   */
  public removeChild(...children: Entity[]): Entity {
    for (let child of children) {
      let index = this.children.indexOf(child);
      if (index !== -1) this.children.splice(index, 1);
    }
    return this;
  }

  /**
   * Adds one or more components to the entity.
   * 
   * @param components The component(s) to add to the entity.
   * @returns The entity for chaining.
   */
  public addComponent(...components: Component[]): Entity {
    for (let component of components) {
      this.components.set(component.constructor.name, component);
    }
    return this;
  }

  /**
   * Gets the given component attached to the entity.
   * 
   * @param c The component constructor to identify the component, for example `MeshComponent`.
   * @returns The component, or `undefined` if not found.
   */
  public getComponent<T extends Component>(c: new (...args: any[]) => T): T | undefined {
    return this.components.get(c.name) as T;
  }

  /**
   * Gets all the entity's components.
   * 
   * @returns An array of all the components attached to the entity.
   */
  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Gets a direct child of the entity.
   * 
   * @param name The name of the child.
   * @returns The child entity, or `undefined` if not found.
   */
  public getChild(name: string): Entity | undefined {
    return this.children.find((child) => child.name === name);
  }

  /**
   * Gets all the children of the entity.
   * 
   * @returns An array of all the entity's children.
   */
  public getChildren(): Entity[] {
    return this.children;
  }

  /**
   * Finds an entity with the given name in the entity's hierarchy, recursively searching all children.
   * 
   * @param name The name of the entity to find.
   * @returns The entity, or `undefined` if not found.
   */
  public find(name: string): Entity | undefined {
    if (this.name === name) return this;

    for (let child of this.children) {
      let result = child.find(name);
      if (result) return result;
    }

    return undefined;
  }

  /**
   * Invokes a method on all components of this entity and all its descendants.
   * 
   * @param method The method to invoke on all components.
   * @param ctx The context to pass to the method.
   */
  public invokeComponentMethod(method: keyof Component, ctx: ComponentContext) {
    for (let child of this.children) {
      child.invokeComponentMethod(method, {
        tsgl: ctx.tsgl,
        entity: child,
        deltaTime: ctx.deltaTime,
      });
    }

    for (let component of this.components.values()) {
      if (component[method]) component[method]!(ctx);
    }
  }

  /**
   * Translates the entity's position by the given vector.
   * 
   * @param vector The vector to translate by.
   */
  public translate(vector: Vector) {
    this.position = this.position.add(vector);
  }

  /**
   * Rotates the entity by the given amount around each of the three axes.
   * 
   * @param vector The vector to rotate by.
   */
  public rotate(vector: Vector) {
    this.rotation = this.rotation.add(vector);
  }

  /**
   * Gets a vector in the forward (-z) direction of the entity.
   * 
   * @returns The forward vector.
   */
  public forward(): Vector {
    return new Vector(
      Math.sin(this.rotation.y),
      0,
      -Math.cos(this.rotation.y)
    );
  }

  /**
   * Gets a vector in the right (-x) direction of the entity.
   * 
   * @returns The right vector.
   */
  public right(): Vector {
    return new Vector(
      -Math.cos(this.rotation.y),
      0,
      -Math.sin(this.rotation.y)
    );
  }

  /**
   * Recalculates the model matrix based on position and rotation.
   */
  private recalculateModel() {
    this.modelMatrix = Matrix.translate(this.position)
      .mul(Matrix.rotateX(this.rotation.x))
      .mul(Matrix.rotateY(this.rotation.y))
      .mul(Matrix.rotateZ(this.rotation.z));
  }

  /**
   * Recalculates the scale matrix.
   */
  private recalculateScale() {
    this.scaleMatrix = Matrix.scale(this.scale);
  }

  /**
   * Recalculates the transformation matrix based on the model and scale matrices.
   */
  private recalculateTransformation() {
    this.transformation = this.modelMatrix.mul(this.scaleMatrix);
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

  /**
   * Renders the entity.
   * 
   * @param tsgl The TSGL instance.
   */
  public render(tsgl: TSGL) {
    this.renderGraph(tsgl, Matrix.identity());
    ShaderProgram.unbindProgram();
  }

  /**
   * Renders the entity and all its descendants using the scene graph algorithm.
   * 
   * @param tsgl The TSGL instance.
   * @param parent The transformation matrix of the parent entity.
   */
  private renderGraph(tsgl: TSGL, parent: Matrix) {
    let mesh = this.getComponent(MeshComponent);

    if (mesh) {
      mesh.render(tsgl, parent.mul(this.transformation));
    }

    for (let child of this.children) {
      child.renderGraph(tsgl, parent.mul(this.modelMatrix));
    }
  }
}

export default Entity;