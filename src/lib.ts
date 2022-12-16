import Camera from "./camera";
import Entity from "./webgl/entity";

class TSGL {
  private canvas: HTMLCanvasElement;
  private ctx: WebGL2RenderingContext;

  public camera: Camera;
  private entities: Entity[];

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("webgl2")!;
    this.camera = new Camera(this.canvas.height / this.canvas.width, 45);

    this.entities = [];

    this.ctx.enable(this.ctx.CULL_FACE);
    this.ctx.cullFace(this.ctx.BACK);
    this.ctx.enable(this.ctx.DEPTH_TEST);

    // fix texture orientation
    // https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/
    this.ctx.pixelStorei(this.ctx.UNPACK_FLIP_Y_WEBGL, true);
  }

  public addEntity(...entities: Entity[]) {
    this.entities.push(...entities);
  }

  public render() {
    this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearColor(1, 1, 1, 1);
    this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);

    for (let entity of this.entities) {
      entity.render(this.camera);
    }
  }

  public getCtx(): WebGL2RenderingContext {
    return this.ctx;
  }
}

export default TSGL;