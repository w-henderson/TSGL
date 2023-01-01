import Component, { ComponentContext } from "tsgl/component";
import Entity from "tsgl/entity";
import { Vector } from "tsgl/matrix";

import { MODELS } from "./models";

class RoadLoader implements Component {
  private count: number = 0;
  private player: Entity | null = null;
  private roads: Entity[] = [];
  private roadKinds = ["road", "bridge"];

  start(ctx: ComponentContext) {
    this.player = ctx.tsgl.root.getChild("player")!;

    let road = this.instantiateSegment();
    ctx.tsgl.root.addChild(road);
    this.roads.push(road);
  }

  update(ctx: ComponentContext) {
    let lastRoad = this.getLastRoad()!;

    while (lastRoad.position.z > (this.player!.position.z - 50)) {
      let newRoad = this.instantiateSegment();
      newRoad.position = lastRoad?.position.add(new Vector(0, 0, -50)) ?? new Vector(0, 0, 0);

      ctx.tsgl.root.addChild(newRoad);
      this.roads.push(newRoad);

      lastRoad = newRoad;
    }

    let firstRoad = this.roads[0];

    while (firstRoad.position.z > (this.player!.position.z + 50)) {
      this.roads.shift();
      ctx.tsgl.root.removeChild(firstRoad);

      firstRoad = this.roads[0];
    }
  }

  private getLastRoad(): Entity | undefined {
    if (this.roads.length === 0) return undefined;
    return this.roads[this.roads.length - 1];
  }

  private instantiateSegment(): Entity {
    let kind = this.roadKinds[Math.floor(Math.random() * this.roadKinds.length)];
    let road = MODELS.get(`assets/models/${kind}.obj`)!(`road${this.count++}`);
    return road;
  }
}

export default RoadLoader;