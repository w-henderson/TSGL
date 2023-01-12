import TSGL from "..";

import Shader from "./shader";
import VERTEX_SHADER from "../shaders/vertex";
import FRAGMENT_SHADER from "../shaders/fragment";

/**
 * A WebGL shader program, consisting of a vertex shader and a fragment shader.
 */
class ShaderProgram {
  private vertexShader: Shader;
  private fragmentShader: Shader;
  private program: WebGLProgram | null;

  private uniformLocations: Map<string, WebGLUniformLocation | null> = new Map();
  private attribLocations: Map<string, number | null> = new Map();

  private static defaultProgram: ShaderProgram | null = null;
  private static boundProgram: ShaderProgram | null = null;

  /**
   * Creates and initialises a shader program from its two constituent shaders.
   * 
   * @param vertexShader The vertex shader.
   * @param fragmentShader The fragment shader.
   */
  constructor(vertexShader: Shader, fragmentShader: Shader) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.program = this.createProgram();
  }

  /**
   * Creates and initialises the underlying `WebGLProgram` using the previously configured vertex and fragment shaders.
   * 
   * @returns A handle to the WebGL program, or `null` if the program could not be created.
   */
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

  /**
   * Gets a handle to the underlying WebGL program.
   * 
   * @returns A handle to the program.
   */
  public getHandle(): WebGLProgram | null {
    return this.program;
  }

  /**
   * Gets the location of a uniform variable in the shader program.
   * 
   * @param name The name of the variable.
   * @returns The location of the variable, or `null` if not found.
   */
  public getUniformLocation(name: string): WebGLUniformLocation | null {
    if (this.uniformLocations.has(name)) return this.uniformLocations.get(name)!;

    let location = TSGL.gl.getUniformLocation(this.program!, name);
    this.uniformLocations.set(name, location);
    return location;
  }

  /**
   * Gets the location of an attribute variable in the shader program.
   * 
   * @param name The name of the variable.
   * @returns The location of the variable, or `null` if not found.
   */
  public getAttribLocation(name: string): number | null {
    if (this.attribLocations.has(name)) return this.attribLocations.get(name)!;

    let location = TSGL.gl.getAttribLocation(this.program!, name);
    if (location === -1) return null;

    this.attribLocations.set(name, location);
    return location;
  }

  /**
   * Binds the program to the WebGL context.
   * 
   * @returns `true` if the program was bound, or `false` if it was already bound.
   */
  public useProgram(): boolean {
    if (ShaderProgram.boundProgram !== this) {
      TSGL.gl.useProgram(this.program!);
      ShaderProgram.boundProgram = this;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Unbinds any currently bound program from the WebGL context.
   */
  public static unbindProgram() {
    TSGL.gl.useProgram(null);
    ShaderProgram.boundProgram = null;
  }

  /**
   * Binds an array of data to the shader program.
   * 
   * @param name The name of the variable in the shader.
   * @param arrayBuffer The WebGL buffer containing the data.
   * @param size The number of components per vertex.
   */
  public bindDataToShader(name: string, arrayBuffer: WebGLBuffer, size: number) {
    TSGL.gl.bindBuffer(TSGL.gl.ARRAY_BUFFER, arrayBuffer);
    let location = this.getAttribLocation(name);
    if (location === null) throw new Error("Invalid attrib location");

    TSGL.gl.enableVertexAttribArray(location);
    TSGL.gl.vertexAttribPointer(location, size, TSGL.gl.FLOAT, false, 0, 0);
  }

  /**
   * Binds a texture to the shader program.
   * 
   * @param sampler The name of the sampler in the shader.
   * @param texture The texture unit to bind to the sampler.
   */
  public bindTextureToShader(sampler: string, texture: number) {
    TSGL.gl.uniform1i(this.getUniformLocation(sampler), texture);
  }

  /**
   * Uploads a `float` value to the shader program.
   * 
   * @param name The name of the `float` variable.
   * @param value The value to upload.
   */
  public uploadFloatToShader(name: string, value: number) {
    TSGL.gl.uniform1f(this.getUniformLocation(name), value);
  }

  /**
   * Get or initialise the default shader program.
   * 
   * @returns The default shader program.
   */
  public static getDefaultProgram(): ShaderProgram {
    if (ShaderProgram.defaultProgram === null) {
      ShaderProgram.defaultProgram = new ShaderProgram(
        new Shader(TSGL.gl.VERTEX_SHADER, VERTEX_SHADER),
        new Shader(TSGL.gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
      );
    }

    return ShaderProgram.defaultProgram;
  }
}

export default ShaderProgram;