import TSGL from "..";

import Shader from "./shader";
import VERTEX_SHADER from "../shaders/vertex";
import FRAGMENT_SHADER from "../shaders/fragment";

class ShaderProgram {
  private vertexShader: Shader;
  private fragmentShader: Shader;
  private output: string;
  private program: WebGLProgram | null;

  private static defaultProgram: ShaderProgram | null = null;
  private static boundProgram: ShaderProgram | null = null;

  constructor(vertexShader: Shader, fragmentShader: Shader, output: string) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.output = output;
    this.program = this.createProgram();
  }

  private createProgram(): WebGLProgram | null {
    let program = TSGL.gl.createProgram();
    if (program === null) return null;

    TSGL.gl.attachShader(program, this.vertexShader.getHandle()!);
    TSGL.gl.attachShader(program, this.fragmentShader.getHandle()!);
    TSGL.gl.linkProgram(program);

    let success = TSGL.gl.getProgramParameter(program, TSGL.gl.LINK_STATUS);
    if (success) return program;

    console.error(TSGL.gl.getProgramInfoLog(program));
    TSGL.gl.deleteProgram(program);

    return null;
  }

  public getHandle(): WebGLProgram | null {
    return this.program;
  }

  public getUniformLocation(name: string): WebGLUniformLocation | null {
    return TSGL.gl.getUniformLocation(this.program!, name);
  }

  public useProgram() {
    if (ShaderProgram.boundProgram !== this) {
      TSGL.gl.useProgram(this.program!);
      ShaderProgram.boundProgram = this;
    }
  }

  public bindDataToShader(name: string, arrayBuffer: WebGLBuffer, size: number) {
    TSGL.gl.bindBuffer(TSGL.gl.ARRAY_BUFFER, arrayBuffer);
    let attributeLocation = TSGL.gl.getAttribLocation(this.program!, name);

    if (attributeLocation === -1) throw Error("invalid attribute location");

    TSGL.gl.enableVertexAttribArray(attributeLocation);
    TSGL.gl.vertexAttribPointer(attributeLocation, size, TSGL.gl.FLOAT, false, 0, 0);
  }

  public bindTextureToShader(sampler: string, texture: number) {
    TSGL.gl.uniform1i(TSGL.gl.getUniformLocation(this.program!, sampler), texture);
  }

  public uploadFloatToShader(name: string, value: number) {
    TSGL.gl.uniform1f(TSGL.gl.getUniformLocation(this.program!, name), value);
  }

  public static getDefaultProgram(): ShaderProgram {
    if (ShaderProgram.defaultProgram === null) {
      ShaderProgram.defaultProgram = new ShaderProgram(
        new Shader(TSGL.gl.VERTEX_SHADER, VERTEX_SHADER),
        new Shader(TSGL.gl.FRAGMENT_SHADER, FRAGMENT_SHADER),
        "color"
      );
    }

    return ShaderProgram.defaultProgram;
  }
}

export default ShaderProgram;