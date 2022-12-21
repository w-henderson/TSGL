import Camera from "./camera";
import Entity from "./entity";

class TSGL {
  private canvas: HTMLCanvasElement;
  private static ctx: WebGL2RenderingContext;

  public camera: Camera;
  private entities: Entity[];

  public constructor(canvas: HTMLCanvasElement) {
    TSGL.ctx = canvas.getContext("webgl2")!;

    this.canvas = canvas;
    this.camera = new Camera(this.canvas.height / this.canvas.width, 45);

    this.entities = [];

    TSGL.ctx.enable(TSGL.ctx.CULL_FACE);
    TSGL.ctx.cullFace(TSGL.ctx.BACK);
    TSGL.ctx.enable(TSGL.ctx.DEPTH_TEST);

    // fix texture orientation
    // https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/
    TSGL.ctx.pixelStorei(TSGL.ctx.UNPACK_FLIP_Y_WEBGL, true);
  }

  public addEntity(...entities: Entity[]) {
    this.entities.push(...entities);
  }

  public render() {
    TSGL.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
    TSGL.ctx.clearColor(1, 1, 1, 1);
    TSGL.ctx.clear(TSGL.ctx.COLOR_BUFFER_BIT | TSGL.ctx.DEPTH_BUFFER_BIT);

    for (let entity of this.entities) {
      entity.render(this.camera);
    }
  }

  public static get gl(): WebGL2RenderingContext {
    if (TSGL.ctx === null) {
      throw new Error("TSGL context is null");
    }

    return TSGL.ctx;
  }
}

export default TSGL;