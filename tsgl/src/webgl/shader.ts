import TSGL from "..";

class Shader {
  private shader: WebGLShader | null;

  constructor(type: number, source: string) {
    this.shader = this.createShader(type, source);
  }

  public getHandle(): WebGLShader | null {
    return this.shader;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    let shader = TSGL.gl.createShader(type);
    if (shader === null) return null;
    TSGL.gl.shaderSource(shader, source);
    TSGL.gl.compileShader(shader);

    let success = TSGL.gl.getShaderParameter(shader, TSGL.gl.COMPILE_STATUS);
    if (success) return shader;

    console.error(TSGL.gl.getShaderInfoLog(shader));
    TSGL.gl.deleteShader(shader);

    return null;
  }
}

export default Shader;