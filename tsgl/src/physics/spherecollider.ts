import Collider from "./collider";
import { Vector } from "../matrix";
import { ComponentContext } from "../component";

class SphereCollider extends Collider {
  public relativeCenter: Vector; // relative
  public relativeRadius: number; // relative

  public center: Vector; // absolute
  public radius: number; // absolute

  constructor(center: Vector, radius: number) {
    super();

    this.relativeCenter = center;
    this.relativeRadius = radius;
    this.center = center;
    this.radius = radius;
  }

  start(ctx: ComponentContext) {
    this.update(ctx);
  }

  update(ctx: ComponentContext) {
    let { position, scale } = ctx.entity;

    this.center = position.add(this.relativeCenter);
    this.radius = scale.x * this.relativeRadius;
  }

  public intersects(other: Collider): boolean {
    if (other instanceof SphereCollider) {
      let distance = this.center.sub(other.center).magnitude();
      return distance <= this.radius + other.radius;
    } else {
      return other.intersects(this);
    }
  }

  public containsPoint(point: Vector): boolean {
    return this.center.sub(point).magnitude() <= this.radius;
  }
}

export default SphereCollider;