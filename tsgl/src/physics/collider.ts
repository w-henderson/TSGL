import Component, { ComponentContext } from "../component";
import { Vector } from "../matrix";

abstract class Collider implements Component {
  public abstract containsPoint(point: Vector): boolean;
  public abstract intersects(other: Collider): boolean;

  start(ctx: ComponentContext) { }
  update(ctx: ComponentContext) { }
}

export default Collider;