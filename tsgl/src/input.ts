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

  private swipeStart: number | null = null;
  private previousSwipePosition: Coordinate2D | null = null;
  private currentSwipePosition: Coordinate2D | null = null;
  private swipeDelta: Coordinate2D = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  public getAxis(axis: keyof typeof AXES): number {
    let positive = AXES[axis].positive.some(key => this.keysDown.has(key)) ? 1 : 0;
    let negative = AXES[axis].negative.some(key => this.keysDown.has(key)) ? 1 : 0;
    return positive - negative;
  }

  public getMouseDelta(): Coordinate2D {
    return this.mouseDelta;
  }

  public getSwipeDelta(): Coordinate2D {
    return this.swipeDelta;
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

  public getTouch(): boolean {
    return this.swipeStart !== null;
  }

  public getTouchDown(): boolean {
    return this.swipeStart === TSGL.currentFrame;
  }

  public unlockMouse() {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  public start() {
    this.canvas.addEventListener("click", () => {
      if (document.pointerLockElement !== this.canvas) this.canvas.requestPointerLock();
    });

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    this.canvas.addEventListener("touchstart", this.onTouchStart);
    this.canvas.addEventListener("touchmove", this.onTouchMove);
    this.canvas.addEventListener("touchend", this.onTouchEnd);
    this.canvas.addEventListener("touchcancel", this.onTouchEnd);

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
    this.swipeDelta.x = 0;
    this.swipeDelta.y = 0;
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

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.currentSwipePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.swipeStart = TSGL.currentFrame;
      this.swipeDelta.x = 0;
      this.swipeDelta.y = 0;
    }

    e.preventDefault();
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.previousSwipePosition = this.currentSwipePosition;
      this.currentSwipePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.swipeDelta.x += this.currentSwipePosition.x - this.previousSwipePosition!.x;
      this.swipeDelta.y += this.currentSwipePosition.y - this.previousSwipePosition!.y;
    }

    e.preventDefault();
  }

  private onTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      this.previousSwipePosition = null;
      this.currentSwipePosition = null;
      this.swipeStart = null;
      this.swipeDelta.x = 0;
      this.swipeDelta.y = 0;
    }

    e.preventDefault();
  }
}

export default Input;