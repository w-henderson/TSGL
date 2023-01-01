import Component, { ComponentContext } from "tsgl/component";
import { Vector } from "tsgl/matrix";

class PlayerController implements Component {
  private movementSpeed = 0.1;

  update(ctx: ComponentContext): void {
    ctx.entity.translate(new Vector(0, 0, -this.movementSpeed));
    ctx.tsgl.camera.position = ctx.entity.position.add(new Vector(0, 2, 4));
  }
}

export default PlayerController;