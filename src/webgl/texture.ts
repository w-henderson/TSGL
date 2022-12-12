class Texture {
  private ctx: WebGL2RenderingContext;
  private texture: WebGLTexture | null;

  constructor(ctx: WebGL2RenderingContext) {
    this.ctx = ctx;
    this.texture = null;
  }

  public bindTexture() {
    this.ctx.activeTexture(this.ctx.TEXTURE0);
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.texture);
  }

  public unbindTexture() {
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
  }
}

export default Texture;