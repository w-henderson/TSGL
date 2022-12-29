import TSGL from ".";

import { Vector } from "./matrix";

export enum LightType {
  Point = 0,
  Directional = 1
}

class Light {
  private static _id = 0;
  public static readonly MAX_LIGHTS = 4;

  public readonly name: string;

  private kind: LightType;
  private vector: Vector;
  private color: Vector;
  private intensity: number;

  constructor(vector: Vector, color?: Vector, intensity?: number, name?: string, kind?: LightType) {
    this.vector = vector;
    this.color = color || new Vector(1, 1, 1);
    this.intensity = intensity || 1;
    this.kind = kind || LightType.Point;
    this.name = name || `Light${Light._id++}`;
  }

  public static point(position: Vector, color?: Vector, intensity?: number, name?: string) {
    return new Light(position, color, intensity, name, LightType.Point);
  }

  public static directional(direction: Vector, color?: Vector, intensity?: number, name?: string) {
    return new Light(direction, color, intensity, name, LightType.Directional);
  }

  public static uploadToShader(lights: Light[], shader: WebGLProgram) {
    let positions = new Float32Array(Light.MAX_LIGHTS * 3);
    let colors = new Float32Array(Light.MAX_LIGHTS * 3);
    let types = new Int16Array(Light.MAX_LIGHTS);

    for (let i = 0; i < lights.length; i++) {
      let light = lights[i];

      let { x, y, z } = light.vector;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      let { x: r, y: g, z: b } = light.color;
      colors[i * 3] = r * light.intensity;
      colors[i * 3 + 1] = g * light.intensity;
      colors[i * 3 + 2] = b * light.intensity;

      types[i] = light.kind;
    }

    let positionLocation = TSGL.gl.getUniformLocation(shader, "light_vectors");
    let colorLocation = TSGL.gl.getUniformLocation(shader, "light_colors");
    let typeLocation = TSGL.gl.getUniformLocation(shader, "light_types");
    let countLocation = TSGL.gl.getUniformLocation(shader, "light_count");

    TSGL.gl.uniform3fv(positionLocation, positions);
    TSGL.gl.uniform3fv(colorLocation, colors);
    TSGL.gl.uniform1iv(typeLocation, types);
    TSGL.gl.uniform1i(countLocation, lights.length);
  }
}

export default Light;