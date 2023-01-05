import Component, { ComponentContext } from "tsgl/component";

class InputManager implements Component {
  private jump = false;
  private slide = false;
  private startGame = false;
  private movement = 0;

  private swipeThreshold = 25;
  private swipeSensitivity = 2;

  update(ctx: ComponentContext) {
    let swipeDelta = ctx.tsgl.input.getSwipeDelta();
    let mouseDelta = ctx.tsgl.input.getMouseDelta();

    this.jump = ctx.tsgl.input.getMouseButtonDown(0) || swipeDelta.y < -this.swipeThreshold;
    this.slide = ctx.tsgl.input.getMouseButtonDown(2) || swipeDelta.y > this.swipeThreshold;
    this.startGame = ctx.tsgl.input.getKeyDown("Enter") || ctx.tsgl.input.getTouchDown();

    this.movement = mouseDelta.x + swipeDelta.x * this.swipeSensitivity;
  }

  public isJumping(): boolean {
    return this.jump;
  }

  public isSliding(): boolean {
    return this.slide;
  }

  public isStartingGame(): boolean {
    return this.startGame;
  }

  public getMovement(): number {
    return this.movement;
  }
}

export default InputManager;