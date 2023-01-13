import Component, { ComponentContext } from "@w-henderson/tsgl/component";
import Entity from "@w-henderson/tsgl/entity";
import { Vector } from "@w-henderson/tsgl/matrix";

import InputManager from "./input";
import PlayerAnimation from "./animation";
import { lerp, lerpVector } from "./util";

class GameManager implements Component {
  private player: Entity | null = null;
  private inputManager: InputManager | null = null;
  private gameState: "pregame" | "game" | "postgame" = "pregame";

  private scoreDisplay: Text | null = null;
  private lastScoreAnimation: number = 0;
  private scoreAnimation: Keyframe[] = [
    { transform: "scale(1) rotate(0deg)" },
    { transform: "scale(1.25) rotate(180deg)" },
    { transform: "scale(1) rotate(360deg)" },
  ];
  private scoreTiming: KeyframeAnimationOptions = {
    duration: 1000,
    iterations: 1,
    easing: "ease-in-out",
  }

  public isGameRunning(): boolean {
    return this.gameState === "game";
  }

  public startGame() {
    document.querySelector(".helptext")!.remove();
    document.querySelector(".overlay")!.classList.remove("hidden");

    this.player!
      .getComponent(PlayerAnimation)!
      .playAnimation("run", 2);

    this.gameState = "game";
  }

  public endGame() {
    this.gameState = "postgame";
  }

  start(ctx: ComponentContext) {
    this.player = ctx.tsgl.root.getChild("player")!;
    this.inputManager = this.player.getComponent(InputManager)!;

    this.scoreDisplay = document.createTextNode("");
    document.querySelector(".score")!.appendChild(this.scoreDisplay);
  }

  update(ctx: ComponentContext) {
    if (this.gameState === "pregame") {
      if (this.inputManager!.isStartingGame()) {
        this.startGame();
      }
    } else if (this.gameState === "game") {
      let score = Math.floor(- 2 - this.player!.position.z)
      this.scoreDisplay!.nodeValue = score.toString();

      if (score % 100 === 0 && score !== this.lastScoreAnimation) {
        this.lastScoreAnimation = score;
        document.querySelector(".score")!.animate(this.scoreAnimation, this.scoreTiming);
      }
    } else if (this.gameState === "postgame") {
      ctx.tsgl.camera.position = lerpVector(ctx.tsgl.camera.position, this.player!.position.add(new Vector(0, 2, 4)), 0.05);
      ctx.tsgl.camera.elevation = lerp(ctx.tsgl.camera.elevation, -0.5, 0.05);

      if (this.inputManager!.isStartingGame()) {
        window.location.reload();
      }
    }
  }
}

export default GameManager;