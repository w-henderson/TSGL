import TSGL from ".";
import Entity from "./entity";

export type ComponentContext = {
  /**
   * The TSGL instance.
   */
  tsgl: TSGL;

  /**
   * The entity that the component is attached to.
   */
  entity: Entity;

  /**
   * The time in seconds since the last frame was rendered.
   */
  deltaTime: number;
}

interface Component {
  /**
   * Called before the first frame is rendered.
   */
  start?(ctx: ComponentContext): void;

  /**
   * Called before each frame is rendered.
   */
  update?(ctx: ComponentContext): void;
}

export default Component;