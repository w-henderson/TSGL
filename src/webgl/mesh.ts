import TSGL from "../lib";

import { Matrix } from "../matrix";

import Camera from "../camera";
import ShaderProgram from "./program";
import Texture from "./texture";
import Material from "../material";

abstract class Mesh {
  public vertexArrayObj: WebGLVertexArrayObject | null = null;
  public indexCount: number = 0;
  public vertexHandle: WebGLBuffer | null = null;
  public normalHandle: WebGLBuffer | null = null;
  public indexHandle: WebGLBuffer | null = null;
  public texHandle: WebGLBuffer | null = null;

  public material: Material | null = null;

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

    shader.bindDataToShader("oc_position", this.getVertexHandle()!, 3);
    shader.bindDataToShader("oc_normal", this.getNormalHandle()!, 3);
    shader.bindDataToShader("texcoord", this.getTexHandle()!, 2);

    this.material!.uploadToShader(shader);

    let mvpMatrix = camera.getProjectionMatrix().mul(camera.getViewMatrix()).mul(modelMatrix);
    mvpMatrix.uploadToShader(shader, "mvp_matrix");
    modelMatrix.uploadToShader(shader, "m_matrix");
    camera.getPosition().uploadToShader(shader, "wc_camera_position");

    let normalMatrix = modelMatrix.invert().transpose3x3();
    normalMatrix.uploadToShader(shader, "normal_matrix");

    let texture = this.material!.mapKd;
    if (!texture || !texture.isLoaded()) texture = Texture.blank();

    texture.bindTexture();
    shader.bindTextureToShader("tex", 0);

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

  public getVertexHandle(): WebGLBuffer | null {
    return this.vertexHandle;
  }

  public getNormalHandle(): WebGLBuffer | null {
    return this.normalHandle;
  }

  public getTexHandle(): WebGLBuffer | null {
    return this.texHandle;
  }
}

export default Mesh;