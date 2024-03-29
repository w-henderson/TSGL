import Component, { ComponentContext } from "@w-henderson/tsgl/component";
import { Vector } from "@w-henderson/tsgl/matrix";

import BoxCollider from "@w-henderson/tsgl/physics/boxcollider";
import PlayerAnimation from "./animation";
import InputManager from "./input";
import GameManager from "./manager";
import ObstacleManager from "./obstacles";
import { lerp, lerpVector } from "./util";

class PlayerController implements Component {
  private gameManager: GameManager | null = null;
  private inputManager: InputManager | null = null;
  private obstacleManager: ObstacleManager | null = null;
  private playerCollider: BoxCollider | null = null;
  private animation: PlayerAnimation | null = null;

  private movementSpeed = 6;
  private acceleration = 0.08;
  private mouseSensitivity = 0.0025;

  private minX = 1.75;
  private maxX = 3.25;

  private specialMovement: "jump" | "slide" | null = null;
  private specialMovementTime = 0;
  private jumpHeight = 0.75;
  private jumpDuration = 0.75;
  private slideDownAmount = 0.25;
  private slideDuration = 1;

  start(ctx: ComponentContext) {
    this.gameManager = ctx.tsgl.root.getComponent(GameManager)!;
    this.obstacleManager = ctx.tsgl.root.getComponent(ObstacleManager)!;
    this.inputManager = ctx.entity.getComponent(InputManager)!;
    this.playerCollider = ctx.entity.getComponent(BoxCollider)!;
    this.animation = ctx.entity.getComponent(PlayerAnimation)!;
  }

  update(ctx: ComponentContext): void {
    if (!this.gameManager!.isGameRunning()) return;

    if (this.specialMovement == null && this.inputManager!.isJumping()) {
      this.specialMovement = "jump";
      this.animation!.animationSpeed = 0.5;
    }

    else if (this.specialMovement == null && this.inputManager!.isSliding()) {
      this.specialMovement = "slide";
      this.animation!.playAnimation("slide", 1 / (this.slideDownAmount * this.slideDuration * 2));
      this.playerCollider!.size = new Vector(0.25, 0.1, 0.1);
    }

    let x = this.inputManager!.getMovement();
    let newX = ctx.entity.position.x + x * this.mouseSensitivity;

    if (newX < this.minX) newX = this.minX;
    if (newX > this.maxX) newX = this.maxX;

    switch (this.specialMovement) {
      case "jump": {
        ctx.entity.position = new Vector(
          newX,
          0.3125 + Math.sin(this.specialMovementTime * Math.PI) * this.jumpHeight,
          ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
        );

        ctx.tsgl.camera.position = new Vector(
          lerp(ctx.tsgl.camera.position.x, ctx.entity.position.x, 12 * ctx.deltaTime),
          ctx.entity.position.y + 0.5,
          ctx.entity.position.z + 3
        )

        ctx.tsgl.camera.elevation = lerp(ctx.tsgl.camera.elevation, -0.1, 12 * ctx.deltaTime);

        this.specialMovementTime += ctx.deltaTime / this.jumpDuration;

        break;
      }

      case "slide": {
        let yHeight = 0.03125;

        if (this.specialMovementTime < this.slideDownAmount) {
          // going down animation

          let amountDown = -Math.sin(((1 - this.specialMovementTime) / this.slideDownAmount) * (Math.PI / 2));

          ctx.entity.position = new Vector(
            newX,
            0.3125 - amountDown * (0.3125 - yHeight),
            ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
          );

          ctx.tsgl.camera.position = new Vector(
            lerp(ctx.tsgl.camera.position.x, ctx.entity.position.x, 12 * ctx.deltaTime),
            lerp(0.8125, yHeight + 1, amountDown),
            lerp(ctx.entity.position.z + 3, ctx.entity.position.z + 2, amountDown)
          )

          ctx.tsgl.camera.elevation = lerp(-0.1, -0.4, amountDown);
        } else if (this.specialMovementTime > 1 - this.slideDownAmount) {
          // going up animation

          let amountDown = 1 + Math.sin(((this.specialMovementTime + 0.75) / this.slideDownAmount) * (Math.PI / 2));

          this.animation!.animationSpeed = 1 / (this.slideDownAmount * this.slideDuration * 2);

          ctx.entity.position = new Vector(
            newX,
            0.3125 - amountDown * (0.3125 - yHeight),
            ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
          );

          ctx.tsgl.camera.position = new Vector(
            lerp(ctx.tsgl.camera.position.x, ctx.entity.position.x, 12 * ctx.deltaTime),
            lerp(0.8125, yHeight + 1, amountDown),
            lerp(ctx.entity.position.z + 3, ctx.entity.position.z + 2, amountDown)
          );

          ctx.tsgl.camera.elevation = lerp(-0.1, -0.4, amountDown);
        } else {
          // during slide

          this.animation!.animationSpeed = 0;

          ctx.entity.position = new Vector(
            newX,
            ctx.entity.position.y,
            ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
          );

          ctx.tsgl.camera.position = new Vector(
            lerp(ctx.tsgl.camera.position.x, ctx.entity.position.x, 12 * ctx.deltaTime),
            yHeight + 1,
            ctx.entity.position.z + 2
          );

          ctx.tsgl.camera.elevation = -0.4;
        }

        this.specialMovementTime += ctx.deltaTime / this.slideDuration;

        break;
      }

      default: {
        ctx.entity.position = new Vector(newX, 0.3125, ctx.entity.position.z - this.movementSpeed * ctx.deltaTime);

        ctx.tsgl.camera.position = new Vector(
          lerp(ctx.tsgl.camera.position.x, ctx.entity.position.x, 12 * ctx.deltaTime),
          0.8125,
          ctx.entity.position.z + 3
        );

        ctx.tsgl.camera.elevation = -0.1;

        break;
      }
    }

    if (this.specialMovementTime > 1) {
      this.specialMovement = null;
      this.specialMovementTime = 0;
      this.playerCollider!.size = new Vector(0.25, 1, 0.1);

      if (this.animation!.animationSpeed == 0.5) this.animation!.animationSpeed = 2;
      else this.animation!.playAnimation("run", 2);
    }

    this.movementSpeed += this.acceleration * ctx.deltaTime;

    if (this.obstacleManager!.checkCollision(this.playerCollider!)) {
      this.animation!.stopAnimation();
      this.gameManager!.endGame();
    }
  }
}

export default PlayerController;