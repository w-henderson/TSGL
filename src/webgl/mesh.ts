import { Matrix } from "../matrix";

import Camera from "../camera";
import ShaderProgram from "./program";
import Texture from "./texture";
import Material from "../material";

abstract class Mesh {
  private ctx: WebGL2RenderingContext;

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

  constructor(ctx: WebGL2RenderingContext) {
    this.ctx = ctx;
  }

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

  public render(camera: Camera, modelMatrix: Matrix, shader: ShaderProgram, texture: Texture) {
    this.ctx.bindVertexArray(this.vertexArrayObj!);
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

    texture.bindTexture();
    shader.bindTextureToShader("tex", 0);

    this.ctx.drawElements(this.ctx.TRIANGLES, this.indexCount, this.ctx.UNSIGNED_SHORT, 0);
    this.ctx.bindVertexArray(null);

    texture.unbindTexture();
  }

  protected loadOntoGPU(vertexPositions: number[], vertexIndices: number[], vertexNormals: number[], textureCoordinates: number[]) {
    this.vertexArrayObj = this.ctx.createVertexArray();
    this.ctx.bindVertexArray(this.vertexArrayObj);

    this.vertexHandle = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertexHandle);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(vertexPositions), this.ctx.STATIC_DRAW);

    this.normalHandle = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.normalHandle);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(vertexNormals), this.ctx.STATIC_DRAW);

    this.indexHandle = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.indexHandle);
    this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), this.ctx.STATIC_DRAW);

    this.texHandle = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.texHandle);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.ctx.STATIC_DRAW);
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