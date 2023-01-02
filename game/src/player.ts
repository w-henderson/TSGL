import Component, { ComponentContext } from "tsgl/component";
import { Vector } from "tsgl/matrix";
import BoxCollider from "tsgl/physics/boxcollider";

import ObstacleManager from "./obstacles";

class PlayerController implements Component {
  private obstacleManager: ObstacleManager | null = null;
  private playerCollider: BoxCollider | null = null;

  private movementSpeed = 0.1;
  private mouseSensitivity = 0.0025;

  private minX = 1.75;
  private maxX = 3.25;

  start(ctx: ComponentContext) {
    this.obstacleManager = ctx.tsgl.root.getComponent(ObstacleManager)!;
    this.playerCollider = ctx.entity.getComponent(BoxCollider)!;
  }

  update(ctx: ComponentContext): void {
    let { x } = ctx.tsgl.input.getMouseDelta();
    let newX = ctx.entity.position.x + x * this.mouseSensitivity;

    if (newX < this.minX) newX = this.minX;
    if (newX > this.maxX) newX = this.maxX;

    ctx.entity.position = new Vector(newX, ctx.entity.position.y, ctx.entity.position.z - this.movementSpeed);
    ctx.tsgl.camera.position = ctx.entity.position.add(new Vector(0, 0.5, 2));

    if (this.obstacleManager!.checkCollision(this.playerCollider!)) {
      console.log("collision detected");
    }
  }
}

export default PlayerController;