import Material from "../material";
import Mesh from "../webgl/mesh";

class ObjMesh extends Mesh {
  private _material: Material;

  private vertices: number[];
  private normals: number[];
  private textureCoordinates: number[];

  private indices: number[];

  constructor(material: Material) {
    super();

    this._material = material;

    this.vertices = [];
    this.normals = [];
    this.textureCoordinates = [];

    this.indices = [];
  }

  public addVertex(vertex: number[], normal: number[], textureCoordinate: number[]) {
    this.vertices.push(...vertex);
    this.normals.push(...normal);
    this.textureCoordinates.push(...textureCoordinate);

    this.indices.push(this.indices.length);
  }

  public async finish() {
    this.initialize();

    if (this._material.mapKd) {
      await this._material.mapKd.load();
    }
  }

  initializeMaterial(): Material {
    return this._material;
  }

  initializeVertexPositions(): number[] {
    return this.vertices;
  }

  initializeVertexIndices(): number[] {
    return this.indices;
  }

  initializeVertexNormals(): number[] {
    return this.normals;
  }

  initializeTextureCoordinates(): number[] {
    return this.textureCoordinates;
  }
}

export default ObjMesh;