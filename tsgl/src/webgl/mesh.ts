import TSGL from "..";

import { Matrix } from "../matrix";
import Material from "../material";

import Camera from "../camera";
import ShaderProgram from "./program";
import Texture from "./texture";

/**
 * A collection of vertices, indices and normals that can be rendered.
 * Also has a material.
 * 
 * To implement this class, you must implement the initialisation methods for vertices, indices, normals and texture coordinates.
 */
abstract class Mesh {
  private vertexArrayObj: WebGLVertexArrayObject | null = null;
  private indexCount: number = 0;
  private vertexHandle: WebGLBuffer | null = null;
  private normalHandle: WebGLBuffer | null = null;
  private indexHandle: WebGLBuffer | null = null;
  private texHandle: WebGLBuffer | null = null;

  private material: Material | null = null;

  /**
   * Returns an array of vertex positions in the format `[x0, y0, z0, x1, y1, z1, ...]`.
   */
  abstract initializeVertexPositions(): number[];

  /**
   * Returns an array of triangle vertex indices in the format `[t0i0, t0i1, t0i2, t1i0, t1i1, t1i2, ...]`.
   */
  abstract initializeVertexIndices(): number[];

  /**
   * Returns an array of vertex normals in the format `[x0, y0, z0, x1, y1, z1, ...]`.
   */
  abstract initializeVertexNormals(): number[];

  /**
   * Returns an array of texture coordinates in the format `[u0, v0, u1, v1, ...]`.
   */
  abstract initializeTextureCoordinates(): number[];

  /**
   * Initializes the mesh and loads the data onto the GPU.
   */
  public initialize() {
    let vertexPositions = this.initializeVertexPositions();
    let vertexIndices = this.initializeVertexIndices();
    let vertexNormals = this.initializeVertexNormals();
    let textureCoordinates = this.initializeTextureCoordinates();
    this.indexCount = vertexIndices.length;

    this.material = this.initializeMaterial();

    this.loadOntoGPU(vertexPositions, vertexIndices, vertexNormals, textureCoordinates);
  }

  /**
   * Initialises the material of the mesh.
   * 
   * If not overridden, returns a blank white material.
   * 
   * @returns The new material of the mesh.
   */
  public initializeMaterial(): Material {
    return new Material();
  }

  /**
   * Renders the mesh using the given camera, model transformation matrix, and shader.
   * 
   * @param camera The camera, used for view and projection matrices.
   * @param modelMatrix The model transformation matrix to apply to the mesh.
   * @param shader The shader to use to render the mesh.
   */
  public render(camera: Camera, modelMatrix: Matrix, shader: ShaderProgram) {
    TSGL.gl.bindVertexArray(this.vertexArrayObj!);
    shader.useProgram();

    // vertices
    shader.bindDataToShader("oc_position", this.vertexHandle!, 3);
    shader.bindDataToShader("oc_normal", this.normalHandle!, 3);
    shader.bindDataToShader("texcoord", this.texHandle!, 2);

    // material
    this.material!.uploadToShader(shader);

    // matrices
    let mvpMatrix = camera.getProjectionMatrix().mul(camera.getViewMatrix()).mul(modelMatrix);
    mvpMatrix.uploadToShader(shader, "mvp_matrix");
    modelMatrix.uploadToShader(shader, "m_matrix");
    let normalMatrix = modelMatrix.invert().transpose3x3();
    normalMatrix.uploadToShader(shader, "normal_matrix");

    // texturing
    let texture = this.material!.mapKd;
    if (!texture || !texture.isLoaded()) texture = Texture.blank();
    texture.bindTexture();
    shader.bindTextureToShader("tex", 0);

    // fog
    shader.uploadFloatToShader("fog_density", camera.fogDensity);
    camera.fogColor.uploadToShader(shader, "fog_color");

    TSGL.gl.drawElements(TSGL.gl.TRIANGLES, this.indexCount, TSGL.gl.UNSIGNED_SHORT, 0);
    TSGL.gl.bindVertexArray(null);

    texture.unbindTexture();
  }

  /**
   * Creates GPU objects for various arrays and loads data into them.
   * 
   * @param vertexPositions An array of vertex positions to be loaded onto the GPU.
   * @param vertexIndices An array of vertex indices to be loaded onto the GPU.
   * @param vertexNormals An array of vertex normals to be loaded onto the GPU.
   * @param textureCoordinates An array of texture coordinates to be loaded onto the GPU.
   */
  protected loadOntoGPU(vertexPositions: number[], vertexIndices: number[], vertexNormals: number[], textureCoordinates: number[]) {
    this.vertexArrayObj = TSGL.gl.createVertexArray();
    TSGL.gl.bindVertexArray(this.vertexArrayObj);

    this.vertexHandle = TSGL.gl.createBuffer();
    TSGL.gl.bindBuffer(TSGL.gl.ARRAY_BUFFER, this.vertexHandle);
    TSGL.gl.bufferData(TSGL.gl.ARRAY_BUFFER, new Float32Array(vertexPositions), TSGL.gl.STATIC_DRAW);

    this.normalHandle = TSGL.gl.createBuffer();
    TSGL.gl.bindBuffer(TSGL.gl.ARRAY_BUFFER, this.normalHandle);
    TSGL.gl.bufferData(TSGL.gl.ARRAY_BUFFER, new Float32Array(vertexNormals), TSGL.gl.STATIC_DRAW);

    this.indexHandle = TSGL.gl.createBuffer();
    TSGL.gl.bindBuffer(TSGL.gl.ELEMENT_ARRAY_BUFFER, this.indexHandle);
    TSGL.gl.bufferData(TSGL.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), TSGL.gl.STATIC_DRAW);

    this.texHandle = TSGL.gl.createBuffer();
    TSGL.gl.bindBuffer(TSGL.gl.ARRAY_BUFFER, this.texHandle);
    TSGL.gl.bufferData(TSGL.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), TSGL.gl.STATIC_DRAW);
  }

  /**
   * Gets the number of indices (triangles) of the mesh.
   * 
   * @returns The number of indices.
   */
  public getIndexCount(): number {
    return this.indexCount;
  }

  /**
   * Gets the material of the mesh. An error is thrown if the mesh is not yet initialised.
   * 
   * @returns The material of the mesh.
   * @throws Error if the mesh is not yet initialised.
   */
  public getMaterial(): Material {
    if (!this.material) throw new Error("Material not initialized");

    return this.material;
  }
}

export default Mesh;