import Collider from "./collider";
import SphereCollider from "./spherecollider";
import { Vector } from "../matrix";
import { ComponentContext } from "../component";

/**
 * An axis-aligned box collider, defined by its centre and size.
 */
class BoxCollider extends Collider {
  private minX: number = -1;
  private maxX: number = -1;
  private minY: number = -1;
  private maxY: number = -1;
  private minZ: number = -1;
  private maxZ: number = -1;

  public center: Vector; // relative
  public size: Vector;   // relative

  constructor(center: Vector, size: Vector) {
    super();
    this.center = center;
    this.size = size;
  }

  start(ctx: ComponentContext) {
    this.update(ctx);
  }

  update(ctx: ComponentContext) {
    let { position, scale } = ctx.entity;

    this.minX = position.x + this.center.x - this.size.x * scale.x / 2;
    this.maxX = position.x + this.center.x + this.size.x * scale.x / 2;
    this.minY = position.y + this.center.y - this.size.y * scale.y / 2;
    this.maxY = position.y + this.center.y + this.size.y * scale.y / 2;
    this.minZ = position.z + this.center.z - this.size.z * scale.z / 2;
    this.maxZ = position.z + this.center.z + this.size.z * scale.z / 2;
  }

  public intersects(other: Collider): boolean {
    if (other instanceof BoxCollider) {
      return (
        this.minX <= other.maxX && this.maxX >= other.minX &&
        this.minY <= other.maxY && this.maxY >= other.minY &&
        this.minZ <= other.maxZ && this.maxZ >= other.minZ
      );
    } else if (other instanceof SphereCollider) {
      let closestPoint = new Vector(
        Math.max(this.minX, Math.min(other.center.x, this.maxX)),
        Math.max(this.minY, Math.min(other.center.y, this.maxY)),
        Math.max(this.minZ, Math.min(other.center.z, this.maxZ))
      );

      return other.containsPoint(closestPoint);
    } else {
      return false;
    }
  }

  public containsPoint(point: Vector): boolean {
    return (
      point.x >= this.minX && point.x <= this.maxX &&
      point.y >= this.minY && point.y <= this.maxY &&
      point.z >= this.minZ && point.z <= this.maxZ
    );
  }
}

export default BoxCollider;