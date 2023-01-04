import TSGL from "..";

import { Matrix } from "../matrix";

import Camera from "../camera";
import ShaderProgram from "./program";
import Texture from "./texture";
import Material from "../material";

abstract class Mesh {
  private vertexArrayObj: WebGLVertexArrayObject | null = null;
  private indexCount: number = 0;
  private vertexHandle: WebGLBuffer | null = null;
  private normalHandle: WebGLBuffer | null = null;
  private indexHandle: WebGLBuffer | null = null;
  private texHandle: WebGLBuffer | null = null;

  private material: Material | null = null;

  abstract initializeVertexPositions(): number[];
  abstract initializeVertexIndices(): number[];
  abstract initializeVertexNormals(): number[];
  abstract initializeTextureCoordinates(): number[];

  constructor() { }

  public initialize() {
    let vertexPositions = this.initializeVertexPositions();
    let vertexIndices = this.initializeVertexIndices();
    let vertexNormals = this.initializeVertexNormals();
    let textureCoordinates = this.initializeTextureCoordinates();
    this.indexCount = vertexIndices.length;

    this.material = this.initializeMaterial();

    this.loadOntoGPU(vertexPositions, vertexIndices, vertexNormals, textureCoordinates);
  }

  public initializeMaterial(): Material {
    return new Material();
  }

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

  public getIndexCount(): number {
    return this.indexCount;
  }

  public getMaterial(): Material {
    if (!this.material) throw new Error("Material not initialized");

    return this.material;
  }
}

export default Mesh;