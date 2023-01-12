import Component, { ComponentContext } from "../component";
import { Vector } from "../matrix";

/**
 * A collider which can be checked for collisions with other colliders.
 */
abstract class Collider implements Component {
  /**
   * Returns true if the point is within the collider.
   * 
   * @param point The position vector of the point.
   * @returns Whether the point is within the collider.
   */
  public abstract containsPoint(point: Vector): boolean;

  /**
   * Checks whether this collider intersects another.
   * 
   * @param other The other collider.
   * @returns Whether the colliders intersect.
   */
  public abstract intersects(other: Collider): boolean;

  start(ctx: ComponentContext) { }
  update(ctx: ComponentContext) { }
}

export default Collider;