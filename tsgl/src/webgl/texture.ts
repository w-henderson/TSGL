import TSGL from "..";

class Texture {
  private source: string | null;
  private texture: WebGLTexture | null;
  private static blankTexture: Texture | null = null;

  constructor(source?: string, texture?: WebGLTexture) {
    this.source = source || null;
    this.texture = texture || null;
  }

  public static blank(): Texture {
    if (Texture.blankTexture) return Texture.blankTexture;

    let texture = TSGL.gl.createTexture()!;

    TSGL.gl.bindTexture(TSGL.gl.TEXTURE_2D, texture);
    TSGL.gl.texImage2D(TSGL.gl.TEXTURE_2D, 0, TSGL.gl.RGBA, 1, 1, 0, TSGL.gl.RGBA, TSGL.gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    TSGL.gl.texParameteri(TSGL.gl.TEXTURE_2D, TSGL.gl.TEXTURE_MIN_FILTER, TSGL.gl.NEAREST);
    TSGL.gl.texParameteri(TSGL.gl.TEXTURE_2D, TSGL.gl.TEXTURE_MAG_FILTER, TSGL.gl.NEAREST);
    TSGL.gl.bindTexture(TSGL.gl.TEXTURE_2D, null);

    Texture.blankTexture = new Texture(undefined, texture);
    return Texture.blankTexture;
  }

  public isLoaded(): boolean {
    return this.texture !== null;
  }

  public async load(): Promise<void> {
    if (!this.source) return;

    let image = new Image();
    let texture = TSGL.gl.createTexture()!;

    let promise = new Promise<void>(res => {
      image.onload = () => {
        TSGL.gl.bindTexture(TSGL.gl.TEXTURE_2D, texture);
        TSGL.gl.texImage2D(TSGL.gl.TEXTURE_2D, 0, TSGL.gl.RGBA, TSGL.gl.RGBA, TSGL.gl.UNSIGNED_BYTE, image);
        TSGL.gl.generateMipmap(TSGL.gl.TEXTURE_2D);
        TSGL.gl.bindTexture(TSGL.gl.TEXTURE_2D, null);

        console.log(`[tex] Loaded \`${this.source}\``);

        this.texture = texture;

        res();
      }

      image.src = this.source!;
    });

    return promise;
  }

  public bindTexture() {
    TSGL.gl.activeTexture(TSGL.gl.TEXTURE0);
    TSGL.gl.bindTexture(TSGL.gl.TEXTURE_2D, this.texture);
  }

  public unbindTexture() {
    TSGL.gl.bindTexture(TSGL.gl.TEXTURE_2D, null);
  }
}

export default Texture;