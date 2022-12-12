import { Matrix } from "./matrix";

import Shader from "./webgl/shader";
import Program from "./webgl/program";
import Cube from "./webgl/cube";
import Texture from "./webgl/texture";
import Camera from "./camera";

import VERTEX_SHADER from "./shaders/vertex";
import FRAGMENT_SHADER from "./shaders/fragment";
import Entity from "./webgl/entity";

class TSGL {
  private canvas: HTMLCanvasElement;
  private ctx: WebGL2RenderingContext;

  private camera: Camera;
  private entity: Entity;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("webgl2")!;
    this.camera = new Camera(this.canvas.height / this.canvas.width, 45);
    this.entity = new Entity(this.ctx, new Cube(this.ctx), new Texture(this.ctx));

    this.ctx.enable(this.ctx.CULL_FACE);
    this.ctx.cullFace(this.ctx.BACK);
    this.ctx.enable(this.ctx.DEPTH_TEST);
  }

  public render() {
    this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearColor(1, 1, 1, 1);
    this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);

    this.entity.render(this.camera);
  }
}

export default TSGL;