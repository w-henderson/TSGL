import Component, { ComponentContext } from "tsgl/component";
import { Vector } from "tsgl/matrix";

import BoxCollider from "tsgl/physics/boxcollider";
import PlayerAnimation from "./animation";
import ObstacleManager from "./obstacles";

class PlayerController implements Component {
  private obstacleManager: ObstacleManager | null = null;
  private playerCollider: BoxCollider | null = null;
  private animation: PlayerAnimation | null = null;

  private movementSpeed = 6;
  private mouseSensitivity = 0.15;

  private minX = 1.75;
  private maxX = 3.25;

  private specialMovement: "jump" | "slide" | null = null;
  private specialMovementTime = 0;
  private jumpHeight = 0.75;
  private jumpDuration = 0.75;
  private slideDownAmount = 0.25;
  private slideDuration = 1;

  start(ctx: ComponentContext) {
    this.obstacleManager = ctx.tsgl.root.getComponent(ObstacleManager)!;
    this.playerCollider = ctx.entity.getComponent(BoxCollider)!;
    this.animation = ctx.entity.getComponent(PlayerAnimation)!;
  }

  update(ctx: ComponentContext): void {
    if (this.specialMovement == null && ctx.tsgl.input.getMouseButtonDown(0)) {
      this.specialMovement = "jump";
      this.animation!.animationSpeed = 0.5;
    }

    else if (this.specialMovement == null && ctx.tsgl.input.getMouseButtonDown(2)) {
      this.specialMovement = "slide";
      this.animation!.playAnimation("slide", 1 / (this.slideDownAmount * this.slideDuration * 2));
      this.playerCollider!.size = new Vector(0.25, 0.1, 0.1);
    }

    switch (this.specialMovement) {
      case "jump": {
        ctx.entity.position = new Vector(
          ctx.entity.position.x,
          0.3125 + Math.sin(this.specialMovementTime * Math.PI) * this.jumpHeight,
          ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
        );

        this.specialMovementTime += ctx.deltaTime / this.jumpDuration;

        break;
      }

      case "slide": {
        let yHeight = 0.03125;

        if (this.specialMovementTime < this.slideDownAmount) {
          ctx.entity.position = new Vector(
            ctx.entity.position.x,
            0.3125 - Math.sin((this.specialMovementTime / this.slideDownAmount) * (Math.PI / 2)) * (0.3125 - yHeight),
            ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
          );
        } else if (this.specialMovementTime > 1 - this.slideDownAmount) {
          this.animation!.animationSpeed = 1 / (this.slideDownAmount * this.slideDuration * 2);

          ctx.entity.position = new Vector(
            ctx.entity.position.x,
            0.3125 - Math.sin(((1 - this.specialMovementTime) / this.slideDownAmount) * (Math.PI / 2)) * (0.3125 - yHeight),
            ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
          );
        } else {
          this.animation!.animationSpeed = 0;

          ctx.entity.position = new Vector(
            ctx.entity.position.x,
            ctx.entity.position.y,
            ctx.entity.position.z - this.movementSpeed * ctx.deltaTime
          );
        }

        this.specialMovementTime += ctx.deltaTime / this.slideDuration;

        break;
      }

      default: {
        let { x } = ctx.tsgl.input.getMouseDelta();
        let newX = ctx.entity.position.x + x * this.mouseSensitivity * ctx.deltaTime;

        if (newX < this.minX) newX = this.minX;
        if (newX > this.maxX) newX = this.maxX;

        ctx.entity.position = new Vector(newX, ctx.entity.position.y, ctx.entity.position.z - this.movementSpeed * ctx.deltaTime);

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

    ctx.tsgl.camera.position = ctx.entity.position.add(new Vector(0, 0.5, 2));

    if (this.obstacleManager!.checkCollision(this.playerCollider!)) {
      console.log("collision detected");
    }
  }
}

export default PlayerController;