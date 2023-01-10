import Component, { ComponentContext } from "tsgl/component";
import Entity from "tsgl/entity";
import { Vector } from "tsgl/matrix";

import { MODELS } from "./models";

type RoadTemplate = {
  model: string,
  repeatable: boolean
};

const ROAD_TEMPLATES: RoadTemplate[] = [
  {
    model: "assets/models/road.obj",
    repeatable: true
  },
  {
    model: "assets/models/bridge.obj",
    repeatable: false
  },
  {
    model: "assets/models/field.obj",
    repeatable: true
  }
];

class RoadLoader implements Component {
  private count: number = 0;
  private player: Entity | null = null;
  private roadQueue: Entity[] = [];
  private roadBufferLength: number = 3;
  private lastRoadName: string | null = null;

  start(ctx: ComponentContext) {
    this.player = ctx.tsgl.root.getChild("player")!;

    this.roadQueue = [
      this.instantiateSegment(ROAD_TEMPLATES[0], 0),
      this.instantiateSegment(ROAD_TEMPLATES[1], 1),
    ];

    for (let [i, road] of this.roadQueue.entries()) {
      road.position = new Vector(0, 0, -50 * i);
      ctx.tsgl.root.addChild(road);
    }

    this.count = 2;

    this.update(ctx);
  }

  update(ctx: ComponentContext) {
    let playerLocation = this.player!.position.z;

    while (this.roadQueue.length > 0 && this.roadQueue[0].position.z > playerLocation + 60) {
      ctx.tsgl.root.removeChild(this.roadQueue.shift()!);
    }

    while (this.roadQueue.length < this.roadBufferLength) {
      let template = this.chooseTemplate();
      let road = this.instantiateSegment(template, this.count++);

      ctx.tsgl.root.addChild(road);
      this.roadQueue.push(road);
    }
  }

  private chooseTemplate(): RoadTemplate {
    let rand = Math.random() * ROAD_TEMPLATES.length;
    let template = ROAD_TEMPLATES[Math.floor(rand)];

    if (!template.repeatable && template.model === this.lastRoadName) {
      template = ROAD_TEMPLATES[0];
    }

    this.lastRoadName = template.model;
    return template;
  }

  private instantiateSegment(template: RoadTemplate, index: number): Entity {
    let entity = MODELS.get(template.model)!(`road${index}`);
    entity.position = new Vector(0, 0, -50 * index);
    return entity;
  }
}

export default RoadLoader;