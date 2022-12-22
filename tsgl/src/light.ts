import TSGL from ".";

import { Vector } from "./matrix";

class Light {
  private static _id = 0;
  public static readonly MAX_LIGHTS = 4;

  public readonly name: string;

  private position: Vector;
  private color: Vector;
  private intensity: number;

  constructor(position: Vector, color?: Vector, intensity?: number, name?: string) {
    this.position = position;
    this.color = color || new Vector(1, 1, 1);
    this.intensity = intensity || 1;
    this.name = name || `Light${Light._id++}`;
  }

  public static uploadToShader(lights: Light[], shader: WebGLProgram) {
    let positions = new Float32Array(Light.MAX_LIGHTS * 3);
    let colors = new Float32Array(Light.MAX_LIGHTS * 3);

    for (let i = 0; i < lights.length; i++) {
      let light = lights[i];

      let { x, y, z } = light.position;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      let { x: r, y: g, z: b } = light.color;
      colors[i * 3] = r * light.intensity;
      colors[i * 3 + 1] = g * light.intensity;
      colors[i * 3 + 2] = b * light.intensity;
    }

    let positionLocation = TSGL.gl.getUniformLocation(shader, "wc_light_positions");
    let colorLocation = TSGL.gl.getUniformLocation(shader, "light_colors");
    let countLocation = TSGL.gl.getUniformLocation(shader, "light_count");

    TSGL.gl.uniform3fv(positionLocation, positions);
    TSGL.gl.uniform3fv(colorLocation, colors);
    TSGL.gl.uniform1i(countLocation, lights.length);
  }
}

export default Light;