import Camera from "./camera";
import Light from "./light";
import Entity from "./entity";
import Input from "./input";

/**
 * The main TSGL class.
 */
class TSGL {
  private canvas: HTMLCanvasElement;
  private static ctx: WebGL2RenderingContext;
  private static frame: number;
  private lastFrameTimestamp: number;

  public camera: Camera;
  public lights: Light[];

  public readonly root: Entity;
  public readonly input: Input;

  /**
   * Creates a new TSGL instance.
   * 
   * Automatically creates a camera with the aspect ratio of the canvas.
   * 
   * @param canvas The canvas to render to.
   */
  public constructor(canvas: HTMLCanvasElement) {
    TSGL.ctx = canvas.getContext("webgl2")!;
    TSGL.frame = 0;

    this.canvas = canvas;
    this.camera = new Camera(this.canvas.height / this.canvas.width, Math.PI / 4);
    this.lights = [];

    this.root = new Entity("root");
    this.input = new Input(this.canvas);

    this.lastFrameTimestamp = performance.now();

    TSGL.ctx.enable(TSGL.ctx.CULL_FACE);
    TSGL.ctx.cullFace(TSGL.ctx.BACK);
    TSGL.ctx.enable(TSGL.ctx.DEPTH_TEST);

    // fix texture orientation
    // https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/
    TSGL.ctx.pixelStorei(TSGL.ctx.UNPACK_FLIP_Y_WEBGL, true);

    this.update = this.update.bind(this);
  }

  /**
   * Adds one or more lights to the scene.
   * 
   * @param lights The light(s) to add to the scene.
   * @throws An error if the number of lights exceeds the maximum (`Light.MAX_LIGHTS`).
   */
  public addLight(...lights: Light[]): void {
    if (this.lights.length + lights.length > Light.MAX_LIGHTS) {
      throw new Error(`Too many lights. Max: ${Light.MAX_LIGHTS}`);
    }

    this.lights.push(...lights);
  }

  /**
   * Gets a specific light by name.
   * 
   * @param name The name of the light.
   * @returns The light, or `undefined` if not found.
   */
  public getLight(name: string): Light | undefined {
    return this.lights.find(light => light.name === name);
  }

  /**
   * Starts the main loop, initialising components then rendering frames.
   */
  public start() {
    this.root.invokeComponentMethod("start", {
      tsgl: this,
      entity: this.root,
      deltaTime: 0
    });

    this.input.start();

    this.lastFrameTimestamp = performance.now();

    window.requestAnimationFrame(this.update);
  }

  /**
   * One frame of the main loop, updating components and input.
   * 
   * @param elapsed The time elapsed since the program started.
   */
  private update(elapsed: number) {
    let deltaTime = (elapsed - this.lastFrameTimestamp) / 1000;
    this.lastFrameTimestamp = elapsed;

    this.root.invokeComponentMethod("update", {
      tsgl: this,
      entity: this.root,
      deltaTime
    });

    this.input.update();

    this.render();

    TSGL.frame++;

    window.requestAnimationFrame(this.update);
  }

  /**
   * Renders the scene.
   */
  private render() {
    TSGL.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
    TSGL.ctx.clearColor(this.camera.background.x, this.camera.background.y, this.camera.background.z, 1);
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