import TSGL from ".";

import { Vector } from "./matrix";
import ShaderProgram from "./webgl/program";

/**
 * The type of light.
 */
export enum LightType {
  /**
   * A point light, which gets dimmer with distance.
   */
  Point = 0,

  /**
   * A directional light.
   */
  Directional = 1
}

/**
 * A light source.
 */
class Light {
  private static _id = 0;
  public static readonly MAX_LIGHTS = 4;

  public readonly name: string;

  private kind: LightType;
  private vector: Vector;
  private color: Vector;
  private intensity: number;

  /**
   * Creates a new light.
   * 
   * @param vector The position of the point light or the direction of the directional light.
   * @param color The colour of the light, or white if not specified.
   * @param intensity The intensity of the light, or 1 if not specified.
   * @param name The name of the light, or "Light" + the number of lights created.
   * @param kind The type of the light, or `LightType.Point` if not specified.
   */
  constructor(vector: Vector, color?: Vector, intensity?: number, name?: string, kind?: LightType) {
    this.vector = vector;
    this.color = color || new Vector(1, 1, 1);
    this.intensity = intensity || 1;
    this.kind = kind || LightType.Point;
    this.name = name || `Light${Light._id++}`;
  }

  /**
   * Creates a new point light.
   * 
   * @param position The position of the light.
   * @param color The colour of the light, or white if not specified.
   * @param intensity The intensity of the light, or 1 if not specified.
   * @param name The name of the light, or "Light" + the number of lights created.
   * @returns The new light.
   */
  public static point(position: Vector, color?: Vector, intensity?: number, name?: string) {
    return new Light(position, color, intensity, name, LightType.Point);
  }

  /**
   * Creates a new directional light.
   * 
   * @param direction The direction of the light.
   * @param color The colour of the light, or white if not specified.
   * @param intensity The intensity of the light, or 1 if not specified.
   * @param name The name of the light, or "Light" + the number of lights created.
   * @returns The new light.
   */
  public static directional(direction: Vector, color?: Vector, intensity?: number, name?: string) {
    return new Light(direction, color, intensity, name, LightType.Directional);
  }

  /**
   * Uploads the array of lights to the given shader.
   * 
   * @param lights The lights to upload to the shader.
   * @param shader The shader to upload the lights to.
   */
  public static uploadToShader(lights: Light[], shader: ShaderProgram) {
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

    let positionLocation = shader.getUniformLocation("light_vectors");
    let colorLocation = shader.getUniformLocation("light_colors");
    let typeLocation = shader.getUniformLocation("light_types");
    let countLocation = shader.getUniformLocation("light_count");

    TSGL.gl.uniform3fv(positionLocation, positions);
    TSGL.gl.uniform3fv(colorLocation, colors);
    TSGL.gl.uniform1iv(typeLocation, types);
    TSGL.gl.uniform1i(countLocation, lights.length);
  }
}

export default Light;