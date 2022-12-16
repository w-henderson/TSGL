import { Matrix } from "../matrix";

import Mesh from "./mesh";
import ShaderProgram from "./program";
import Shader from "./shader";
import Texture from "./texture";
import Camera from "../camera";

import VERTEX_SHADER from "../shaders/vertex";
import FRAGMENT_SHADER from "../shaders/fragment";

class Entity {
  private ctx: WebGL2RenderingContext;
  public model: Matrix;
  private mesh: Mesh;
  private shader: ShaderProgram;
  private texture: Texture;

  constructor(ctx: WebGL2RenderingContext, mesh: Mesh, texture: Texture) {
    this.ctx = ctx;
    this.model = Matrix.squareFromArray([
      0.02, 0, 0, 0,
      0, 0.02, 0, 0,
      0, 0, 0.02, 0,
      0, 0, 0, 1
    ]);
    this.mesh = mesh;
    this.texture = texture;

    this.shader = new ShaderProgram(
      this.ctx,
      new Shader(this.ctx, this.ctx.VERTEX_SHADER, VERTEX_SHADER),
      new Shader(this.ctx, this.ctx.FRAGMENT_SHADER, FRAGMENT_SHADER),
      "color"
    );
  }

  render(camera: Camera) {
    this.mesh.preRender(this.shader);

    this.shader.bindDataToShader("oc_position", this.mesh.getVertexHandle()!, 3);
    this.shader.bindDataToShader("oc_normal", this.mesh.getNormalHandle()!, 3);
    this.shader.bindDataToShader("texcoord", this.mesh.getTexHandle()!, 2);

    this.mesh.render(camera, this.model, this.shader, this.texture);
  }
}

export default Entity;