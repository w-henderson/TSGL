class Texture {
  private ctx: WebGL2RenderingContext | null;
  private source: string | null;
  private texture: WebGLTexture | null;

  constructor(ctx?: WebGL2RenderingContext, source?: string, texture?: WebGLTexture) {
    this.ctx = ctx || null;
    this.source = source || null;
    this.texture = texture || null;
  }

  public static blank(ctx: WebGL2RenderingContext): Texture {
    let texture = ctx.createTexture()!;

    ctx.bindTexture(ctx.TEXTURE_2D, texture);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, 1, 1, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
    ctx.bindTexture(ctx.TEXTURE_2D, null);

    return new Texture(ctx, undefined, texture);
  }

  public isLoaded(): boolean {
    return this.texture !== null;
  }

  public async load(ctx: WebGL2RenderingContext): Promise<void> {
    this.ctx = ctx;

    if (!this.source) return;

    let image = new Image();
    let texture = this.ctx.createTexture()!;

    let promise = new Promise<void>(res => {
      image.onload = () => {
        ctx.bindTexture(ctx.TEXTURE_2D, texture);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
        ctx.generateMipmap(ctx.TEXTURE_2D);
        ctx.bindTexture(ctx.TEXTURE_2D, null);

        console.log(`[tex] Loaded \`${this.source}\``);

        this.texture = texture;

        res();
      }

      image.src = this.source!;
    });

    return promise;
  }

  public bindTexture() {
    if (!this.ctx) return;

    this.ctx.activeTexture(this.ctx.TEXTURE0);
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.texture);
  }

  public unbindTexture() {
    if (!this.ctx) return;

    this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
  }
}

export default Texture;