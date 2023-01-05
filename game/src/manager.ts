import Component, { ComponentContext } from "tsgl/component";
import Entity from "tsgl/entity";
import { Vector } from "tsgl/matrix";

import PlayerAnimation from "./animation";
import { lerp, lerpVector } from "./util";

class GameManager implements Component {
  private gameState: "pregame" | "game" | "postgame" = "pregame";
  private player: Entity | null = null;

  public isGameRunning(): boolean {
    return this.gameState === "game";
  }

  public startGame() {
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
  }

  update(ctx: ComponentContext) {
    if (this.gameState === "pregame") {
      if (ctx.tsgl.input.getKeyDown("Enter")) {
        this.startGame();
      }
    } else if (this.gameState === "postgame") {
      ctx.tsgl.camera.position = lerpVector(ctx.tsgl.camera.position, this.player!.position.add(new Vector(0, 2, 4)), 0.05);
      ctx.tsgl.camera.elevation = lerp(ctx.tsgl.camera.elevation, -0.5, 0.05);
    }
  }
}

export default GameManager;