import Component, { ComponentContext } from "tsgl/component";
import { Vector } from "tsgl/matrix";

class DrivingComponent implements Component {
  private speed: number = 0;
  private turning: number = 0;

  private maxSpeed: number = 1;
  private maxTurning: number = 0.1;

  private wheelTurnMultiplier: number = 0.5;
  private steeringWheelTurnMultiplier: number = 1;

  private animate(ctx: ComponentContext) {
    let frontLeftWheel = ctx.entity.getChild("FrontLeftWheel")!;
    let frontRightWheel = ctx.entity.getChild("FrontRightWheel")!;
    let steeringWheel = ctx.entity.getChild("SteeringWheel")!;

    frontLeftWheel.rotation = new Vector(0, this.turning * this.wheelTurnMultiplier, 0);
    frontRightWheel.rotation = new Vector(0, Math.PI + this.turning * this.wheelTurnMultiplier, 0);
    steeringWheel.rotation = new Vector(this.turning * this.steeringWheelTurnMultiplier, 0, 0);
  }

  update(ctx: ComponentContext) {
    this.speed = ctx.tsgl.input.getAxis("vertical");
    this.turning = ctx.tsgl.input.getAxis("horizontal");

    let distance = this.speed * this.maxSpeed; // distance moved this frame
    let angle = Math.abs(this.speed) * this.turning * this.maxTurning; // angle turned this frame

    let forward = ctx.entity.right().scale(distance); // forward is actually right in the model
    let right = ctx.entity.forward().scale(distance * Math.tan(angle));

    ctx.entity.translate(forward.add(right));
    ctx.entity.rotate(new Vector(0, angle, 0));

    this.animate(ctx);
  }
}

export default DrivingComponent;