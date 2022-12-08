import vertex from "./shaders/vertex";
import fragment from "./shaders/fragment";

import { createShader } from "./webgl/shader";
import { createProgram } from "./webgl/program";

class TSGL {
  private canvas: HTMLCanvasElement;
  private ctx: WebGLRenderingContext;

  private vertexShader: WebGLShader | null = null;
  private fragmentShader: WebGLShader | null = null;
  private program: WebGLProgram | null = null;

  private positionBuffer: WebGLBuffer | null = null;
  private positionAttributeLocation: number = 0;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("webgl")!;

    this.vertexShader = createShader(this.ctx, this.ctx.VERTEX_SHADER, vertex);
    this.fragmentShader = createShader(this.ctx, this.ctx.FRAGMENT_SHADER, fragment);
    this.program = createProgram(this.ctx, this.vertexShader!, this.fragmentShader!);

    this.positionAttributeLocation = this.ctx.getAttribLocation(this.program!, "oc_position");
    this.positionBuffer = this.ctx.createBuffer();
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positionBuffer);

    let positions = [
      0, 0,
      0, 0.5,
      0.7, 0
    ];
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(positions), this.ctx.STATIC_DRAW);

    this.render();
  }

  public render() {
    this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearColor(0, 0, 0, 1);
    this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);

    this.ctx.useProgram(this.program!);

    this.ctx.enableVertexAttribArray(this.positionAttributeLocation);

    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positionBuffer);

    let size = 2;
    let type = this.ctx.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    this.ctx.vertexAttribPointer(this.positionAttributeLocation, size, type, normalize, stride, offset);

    let primitiveType = this.ctx.TRIANGLES;
    let count = 3;
    this.ctx.drawArrays(primitiveType, offset, count);
  }
}

export default TSGL;