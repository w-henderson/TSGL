import Component, { ComponentContext } from "tsgl/component";
import { Vector } from "tsgl/matrix";

class CameraComponent implements Component {
  private movementSpeed = 0.1;
  private mouseSensitivity = 0.002;

  update(ctx: ComponentContext) {
    let forward = ctx.tsgl.input.getAxis("vertical");
    let right = ctx.tsgl.input.getAxis("horizontal");
    let up = ctx.tsgl.input.getAxis("roll");

    ctx.tsgl.camera.position = ctx.tsgl.camera.position
      .add(ctx.tsgl.camera.getDirection().scale(forward * this.movementSpeed))
      .add(ctx.tsgl.camera.getRight().scale(right * this.movementSpeed))
      .add(new Vector(0, 1, 0).scale(up * this.movementSpeed));

    let { x, y } = ctx.tsgl.input.getMouseDelta();
    ctx.tsgl.camera.azimuth -= x * this.mouseSensitivity;
    ctx.tsgl.camera.elevation -= y * this.mouseSensitivity;
  }
}

export default CameraComponent;