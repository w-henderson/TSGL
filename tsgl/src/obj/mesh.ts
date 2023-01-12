import Material from "../material";
import Mesh from "../webgl/mesh";

/**
 * A mesh that was loaded from a Wavefront OBJ file.
 */
class ObjMesh extends Mesh {
  private _material: Material;

  private vertices: number[];
  private normals: number[];
  private textureCoordinates: number[];

  private indices: number[];

  /**
   * Creates a blank mesh with the given material.
   * 
   * @param material The material to use for this mesh.
   */
  constructor(material: Material) {
    super();

    this._material = material;

    this.vertices = [];
    this.normals = [];
    this.textureCoordinates = [];

    this.indices = [];
  }

  /**
   * Adds a vertex to the mesh.
   * 
   * @param vertex The coordinates of the vertex.
   * @param normal The components of the normal.
   * @param textureCoordinate The texture coordinate.
   */
  public addVertex(vertex: number[], normal: number[], textureCoordinate: number[]) {
    this.vertices.push(...vertex);
    this.normals.push(...normal);
    this.textureCoordinates.push(...textureCoordinate);

    this.indices.push(this.indices.length);
  }

  /**
   * Finishes loading the mesh by initialising WebGL objects and loading textures.
   */
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