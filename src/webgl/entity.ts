import TSGL from "../lib";

import { Matrix } from "../matrix";

import Mesh from "./mesh";
import ShaderProgram from "./program";
import Shader from "./shader";

import Camera from "../camera";

import VERTEX_SHADER from "../shaders/vertex";
import FRAGMENT_SHADER from "../shaders/fragment";

class WebGLEntity {
  public model: Matrix;
  protected mesh: Mesh;
  protected shader: ShaderProgram;

  constructor(mesh: Mesh) {
    this.model = Matrix.squareFromArray([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    this.mesh = mesh;

    this.shader = new ShaderProgram(
      new Shader(TSGL.gl.VERTEX_SHADER, VERTEX_SHADER),
      new Shader(TSGL.gl.FRAGMENT_SHADER, FRAGMENT_SHADER),
      "color"
    );
  }

  render(camera: Camera) {
    this.mesh.render(camera, this.model, this.shader);
  }
}

export default WebGLEntity;