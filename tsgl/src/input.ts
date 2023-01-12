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

/**
 * Input management for TSGL.
 */
class Input {
  private canvas: HTMLCanvasElement;

  private keysDown = new Map<string, number>();
  private mouseDown = new Map<number, number>();
  private mouseDelta: Coordinate2D = { x: 0, y: 0 };

  private swipeStart: number | null = null;
  private previousSwipePosition: Coordinate2D | null = null;
  private currentSwipePosition: Coordinate2D | null = null;
  private swipeDelta: Coordinate2D = { x: 0, y: 0 };

  /**
   * Creates a new input manager.
   * 
   * @param canvas The canvas to detect input on.
   */
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

  /**
   * Gets the movement along a specific axis.
   * 
   * Inspired by Unity's input system, this allows you to treat discrete keyboard inputs as a single axis.
   * 
   * - "horizontal": A-D and Left-Right
   * - "vertical": W-S and Up-Down
   * - "roll": Q-E
   * 
   * @param axis The axis.
   * @returns The movement on the axis.
   */
  public getAxis(axis: keyof typeof AXES): number {
    let positive = AXES[axis].positive.some(key => this.keysDown.has(key)) ? 1 : 0;
    let negative = AXES[axis].negative.some(key => this.keysDown.has(key)) ? 1 : 0;
    return positive - negative;
  }

  /**
   * Get the mouse movement since the last frame.
   * 
   * @returns The movement of the mouse.
   */
  public getMouseDelta(): Coordinate2D {
    return this.mouseDelta;
  }

  /**
   * Get the swipe movement since the last frame, or since the swipe began.
   * 
   * @returns The movement of the swipe.
   */
  public getSwipeDelta(): Coordinate2D {
    return this.swipeDelta;
  }

  /**
   * Returns true if the given key is currently held down.
   * 
   * @param key The name of the key.
   * @returns Whether the key is currently held down.
   */
  public getKey(key: string): boolean {
    return this.keysDown.has(key);
  }

  /**
   * Returns true if the given key was pressed since the last frame.
   * 
   * @param key The name of the key.
   * @returns Whether the key was pressed since the last frame.
   */
  public getKeyDown(key: string): boolean {
    return this.keysDown.get(key) === TSGL.currentFrame;
  }

  /**
   * Returns true if the given mouse button is currently held down.
   * 
   * @param button The index of the mouse button.
   * @returns Whether the mouse button is currently held down.
   */
  public getMouseButton(button: number): boolean {
    return this.mouseDown.has(button);
  }

  /**
   * Returns true if the given mouse button was pressed since the last frame.
   * 
   * @param button The index of the mouse button.
   * @returns Whether the mouse button was pressed since the last frame.
   */
  public getMouseButtonDown(button: number): boolean {
    return this.mouseDown.get(button) === TSGL.currentFrame;
  }

  /**
   * Returns true if the user is currently touching the screen.
   * 
   * @returns Whether the user is currently touching the screen.
   */
  public getTouch(): boolean {
    return this.swipeStart !== null;
  }

  /**
   * Returns true if the user began touching the screen this frame.
   * 
   * @returns Whether the user began touching the screen this frame.
   */
  public getTouchDown(): boolean {
    return this.swipeStart === TSGL.currentFrame;
  }

  /**
   * Unlocks the mouse from the canvas, if locked.
   */
  public unlockMouse() {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  /**
   * Initialises input events.
   */
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

  /**
   * Resets the input state. Should be called after input has been processed this frame.
   */
  public update() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.swipeDelta.x = 0;
    this.swipeDelta.y = 0;
  }

  /**
   * Handles mouse move events.
   * 
   * @param e The mouse move event.
   */
  private onMouseMove(e: MouseEvent) {
    this.mouseDelta.x += e.movementX;
    this.mouseDelta.y += e.movementY;
  }

  /**
   * Handles mouse down events.
   * 
   * @param e The mouse down event.
   */
  private onMouseDown(e: MouseEvent) {
    this.mouseDown.set(e.button, TSGL.currentFrame);
  }

  /**
   * Handles mouse up events.
   * 
   * @param e The mouse up event.
   */
  private onMouseUp(e: MouseEvent) {
    this.mouseDown.delete(e.button);
  }

  /**
   * Handles key down events.
   * 
   * @param e The key down event.
   */
  private onKeyDown(e: KeyboardEvent) {
    this.keysDown.set(e.key, TSGL.currentFrame);
  }

  /**
   * Handles key up events.
   * 
   * @param e The key up event.
   */
  private onKeyUp(e: KeyboardEvent) {
    this.keysDown.delete(e.key);
  }

  /**
   * Handles touch start events.
   * 
   * @param e The touch start event.
   */
  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.currentSwipePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.swipeStart = TSGL.currentFrame;
      this.swipeDelta.x = 0;
      this.swipeDelta.y = 0;
    }

    e.preventDefault();
  }

  /**
   * Handles touch move events.
   * 
   * @param e The touch move event.
   */
  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.previousSwipePosition = this.currentSwipePosition;
      this.currentSwipePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.swipeDelta.x += this.currentSwipePosition.x - this.previousSwipePosition!.x;
      this.swipeDelta.y += this.currentSwipePosition.y - this.previousSwipePosition!.y;
    }

    e.preventDefault();
  }

  /**
   * Handles touch end and touch cancel events.
   * 
   * @param e The touch end or touch cancel event.
   */
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