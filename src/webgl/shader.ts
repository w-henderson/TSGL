class Shader {
  private ctx: WebGL2RenderingContext;
  private shader: WebGLShader | null;

  constructor(ctx: WebGL2RenderingContext, type: number, source: string) {
    this.ctx = ctx;
    this.shader = this.createShader(type, source);
  }

  public getHandle(): WebGLShader | null {
    return this.shader;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    let shader = this.ctx.createShader(type);
    if (shader === null) return null;
    this.ctx.shaderSource(shader, source);
    this.ctx.compileShader(shader);

    let success = this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS);
    if (success) return shader;

    console.error(this.ctx.getShaderInfoLog(shader));
    this.ctx.deleteShader(shader);

    return null;
  }
}

export default Shader;