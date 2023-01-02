import Component, { ComponentContext } from "tsgl/component";
import Entity from "tsgl/entity";
import { Vector } from "tsgl/matrix";

import { MODELS } from "./models";

class RoadLoader implements Component {
  private count: number = 0;
  private player: Entity | null = null;
  private roads: Entity[] = [];
  private roadBufferLength: number = 3;

  start(ctx: ComponentContext) {
    this.player = ctx.tsgl.root.getChild("player")!;
    this.roads = [
      this.instantiateSegment("road", 0),
      this.instantiateSegment("bridge", 1),
      this.instantiateSegment("road", 2)
    ];

    for (let [i, road] of this.roads.entries()) {
      road.position = new Vector(0, 0, -50 * i);
      ctx.tsgl.root.addChild(road);
    }
  }

  update(ctx: ComponentContext) {
    let road = this.roads[this.count % this.roadBufferLength];

    if (road.position.z > (this.player!.position.z + 50)) {
      road.position = road.position.add(new Vector(0, 0, -50 * this.roadBufferLength));
      this.count++;
    }
  }

  private instantiateSegment(kind: string, index: number): Entity {
    return MODELS.get(`assets/models/${kind}.obj`)!(`road${index}`);
  }
}

export default RoadLoader;