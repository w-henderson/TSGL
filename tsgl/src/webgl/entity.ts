import TSGL from "..";

import { Matrix } from "../matrix";

import Mesh from "./mesh";
import ShaderProgram from "./program";
import Shader from "./shader";

import Camera from "../camera";
import Light from "../light";

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

    this.shader = ShaderProgram.getDefaultProgram();
  }

  render(tsgl: TSGL) {
    this.shader.useProgram();
    tsgl.camera.getPosition().uploadToShader(this.shader, "wc_camera_position");
    Light.uploadToShader(tsgl.lights, this.shader);

    this.mesh.render(tsgl.camera, this.model, this.shader);
  }
}

export default WebGLEntity;