import TSGL from ".";

type Coordinate2D = {
  x: number;
  y: number;
};

const AXES = {
  "horizontal": {
    positive: ["d", "ArrowRight"],
    negative: ["a", "ArrowLeft"]
  },
  "vertical": {
    positive: ["w", "ArrowUp"],
    negative: ["s", "ArrowDown"]
  },
  "roll": {
    positive: ["e"],
    negative: ["q"]
  }
};

class Input {
  private canvas: HTMLCanvasElement;

  private keysDown = new Map<string, number>();
  private mouseDown = new Map<number, number>();
  private mouseDelta: Coordinate2D = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  public getAxis(axis: keyof typeof AXES): number {
    let positive = AXES[axis].positive.some(key => this.keysDown.has(key)) ? 1 : 0;
    let negative = AXES[axis].negative.some(key => this.keysDown.has(key)) ? 1 : 0;
    return positive - negative;
  }

  public getMouseDelta(): Coordinate2D {
    return this.mouseDelta;
  }

  public getKey(key: string): boolean {
    return this.keysDown.has(key);
  }

  public getKeyDown(key: string): boolean {
    return this.keysDown.get(key) === TSGL.currentFrame;
  }

  public getMouseButton(button: number): boolean {
    return this.mouseDown.has(button);
  }

  public getMouseButtonDown(button: number): boolean {
    return this.mouseDown.get(button) === TSGL.currentFrame;
  }

  public start() {
    this.canvas.addEventListener("click", () => this.canvas.requestPointerLock());

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.canvas) {
        console.log("[pointerlockchange] pointer locked");
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mousedown", this.onMouseDown);
        document.addEventListener("mouseup", this.onMouseUp);
      } else {
        console.log("[pointerlockchange] pointer unlocked");
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mousedown", this.onMouseDown);
        document.removeEventListener("mouseup", this.onMouseUp);
      }
    });
  }

  public update() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }

  private onMouseMove(e: MouseEvent) {
    this.mouseDelta.x += e.movementX;
    this.mouseDelta.y += e.movementY;
  }

  private onMouseDown(e: MouseEvent) {
    this.mouseDown.set(e.button, TSGL.currentFrame);
  }

  private onMouseUp(e: MouseEvent) {
    this.mouseDown.delete(e.button);
  }

  private onKeyDown(e: KeyboardEvent) {
    this.keysDown.set(e.key, TSGL.currentFrame);
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keysDown.delete(e.key);
  }
}

export default Input;