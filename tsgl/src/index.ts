import Camera from "./camera";
import Light from "./light";
import Entity from "./entity";
import Input from "./input";

import Empty from "./webgl/empty";

class TSGL {
  private canvas: HTMLCanvasElement;
  private static ctx: WebGL2RenderingContext;
  private static frame: number;

  public camera: Camera;
  public lights: Light[];

  public readonly root: Entity;
  public readonly input: Input;

  public constructor(canvas: HTMLCanvasElement) {
    TSGL.ctx = canvas.getContext("webgl2")!;
    TSGL.frame = 0;

    this.canvas = canvas;
    this.camera = new Camera(this.canvas.height / this.canvas.width, 45);
    this.lights = [];

    this.root = new Entity(new Empty(), "root");
    this.input = new Input(this.canvas);

    TSGL.ctx.enable(TSGL.ctx.CULL_FACE);
    TSGL.ctx.cullFace(TSGL.ctx.BACK);
    TSGL.ctx.enable(TSGL.ctx.DEPTH_TEST);

    // fix texture orientation
    // https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/
    TSGL.ctx.pixelStorei(TSGL.ctx.UNPACK_FLIP_Y_WEBGL, true);
  }

  public addLight(...lights: Light[]): void {
    if (this.lights.length + lights.length > Light.MAX_LIGHTS) {
      throw new Error(`Too many lights. Max: ${Light.MAX_LIGHTS}`);
    }

    this.lights.push(...lights);
  }

  public start() {
    this.root.invokeComponentMethod("start", {
      tsgl: this,
      entity: this.root
    });

    this.input.start();

    window.requestAnimationFrame(this.update.bind(this));
  }

  private update() {
    this.root.invokeComponentMethod("update", {
      tsgl: this,
      entity: this.root
    });

    this.input.update();

    this.render();

    TSGL.frame++;

    window.requestAnimationFrame(this.update.bind(this));
  }

  private render() {
    TSGL.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
    TSGL.ctx.clearColor(1, 1, 1, 1);
    TSGL.ctx.clear(TSGL.ctx.COLOR_BUFFER_BIT | TSGL.ctx.DEPTH_BUFFER_BIT);

    this.root.render(this);
  }

  public static get gl(): WebGL2RenderingContext {
    if (TSGL.ctx === null) {
      throw new Error("TSGL context is null");
    }

    return TSGL.ctx;
  }

  public static get currentFrame(): number {
    return TSGL.frame;
  }
}

export default TSGL;