import TSGL from "./lib";
import Entity from "./entity";

export type ComponentContext = {
  tsgl: TSGL;
  entity: Entity;
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