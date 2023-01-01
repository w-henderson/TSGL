import Component, { ComponentContext } from "../component";
import Entity from "../entity";
import { Vector } from "../matrix";

import BoxCollider from "./colliders/box";
import SphereCollider from "./colliders/sphere";

abstract class Collider implements Component {
  public abstract containsPoint(point: Vector): boolean;
  public abstract intersects(other: Collider): boolean;

  start(ctx: ComponentContext) { }
  update(ctx: ComponentContext) { }
}

export default Collider;
export { BoxCollider, SphereCollider };