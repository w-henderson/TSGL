import Shader from "./shader";

class ShaderProgram {
  private ctx: WebGL2RenderingContext;
  private vertexShader: Shader;
  private fragmentShader: Shader;
  private output: string;
  private program: WebGLProgram | null;

  constructor(ctx: WebGL2RenderingContext, vertexShader: Shader, fragmentShader: Shader, output: string) {
    this.ctx = ctx;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.output = output;
    this.program = this.createProgram();
  }

  private createProgram(): WebGLProgram | null {
    let program = this.ctx.createProgram();
    if (program === null) return null;

    this.ctx.attachShader(program, this.vertexShader.getHandle()!);
    this.ctx.attachShader(program, this.fragmentShader.getHandle()!);
    //this.ctx.bindFragDataLocation(program, 0, this.output);
    this.ctx.linkProgram(program);

    let success = this.ctx.getProgramParameter(program, this.ctx.LINK_STATUS);
    if (success) return program;

    console.error(this.ctx.getProgramInfoLog(program));
    this.ctx.deleteProgram(program);

    return null;
  }

  public getHandle(): WebGLProgram | null {
    return this.program;
  }

  public getContext(): WebGL2RenderingContext {
    return this.ctx;
  }

  public getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.ctx.getUniformLocation(this.program!, name);
  }

  public useProgram() {
    this.ctx.useProgram(this.program!);
  }

  public bindDataToShader(name: string, arrayBuffer: WebGLBuffer, size: number) {
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, arrayBuffer);
    let attributeLocation = this.ctx.getAttribLocation(this.program!, name);

    if (attributeLocation === -1) return;

    this.ctx.vertexAttribPointer(attributeLocation, size, this.ctx.FLOAT, false, 0, 0);
    this.ctx.enableVertexAttribArray(attributeLocation);
  }

  public bindTextureToShader(sampler: string, texture: number) {
    this.ctx.uniform1i(this.ctx.getUniformLocation(this.program!, sampler), texture);
  }
}

export default ShaderProgram;