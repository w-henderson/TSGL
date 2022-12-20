import { Matrix } from "../matrix";

import Mesh from "./mesh";
import ShaderProgram from "./program";
import Shader from "./shader";

import Camera from "../camera";

import VERTEX_SHADER from "../shaders/vertex";
import FRAGMENT_SHADER from "../shaders/fragment";

class WebGLEntity {
  protected ctx: WebGL2RenderingContext;
  public model: Matrix;
  protected mesh: Mesh;
  protected shader: ShaderProgram;

  constructor(ctx: WebGL2RenderingContext, mesh: Mesh) {
    this.ctx = ctx;
    this.model = Matrix.squareFromArray([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    this.mesh = mesh;

    this.shader = new ShaderProgram(
      this.ctx,
      new Shader(this.ctx, this.ctx.VERTEX_SHADER, VERTEX_SHADER),
      new Shader(this.ctx, this.ctx.FRAGMENT_SHADER, FRAGMENT_SHADER),
      "color"
    );
  }

  render(camera: Camera) {
    this.mesh.render(camera, this.model, this.shader);
  }
}

export default WebGLEntity;