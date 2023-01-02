import Component, { ComponentContext } from "tsgl/component";
import { Vector } from "tsgl/matrix";
import Entity from "tsgl/entity";
import BoxCollider from "tsgl/physics/boxcollider";

import { MODELS } from "./models";

type ObstacleTemplate = {
  model: string,
  minSpawnX: number,
  maxSpawnX: number,
  continuous: boolean,
  colliderCenter: Vector,
  colliderSize: Vector
}

const OBSTACLE_TEMPLATES: ObstacleTemplate[] = [
  {
    model: "assets/models/car.obj",
    minSpawnX: 2,
    maxSpawnX: 3,
    continuous: true,
    colliderCenter: new Vector(0, 0.5, -0.877),
    colliderSize: new Vector(0.74, 1, 1.76)
  },
  {
    model: "assets/models/lorry.obj",
    minSpawnX: 2.1,
    maxSpawnX: 2.9,
    continuous: true,
    colliderCenter: new Vector(0, 0.55, -1.242),
    colliderSize: new Vector(0.87, 1.1, 2.48)
  },
  {
    model: "assets/models/cones.obj",
    minSpawnX: 2.05,
    maxSpawnX: 2.95,
    continuous: false,
    colliderCenter: new Vector(0, 0.09, 0),
    colliderSize: new Vector(0.855, 0.18, 0.23)
  },
  {
    model: "assets/models/barrier.obj",
    minSpawnX: 2.5,
    maxSpawnX: 2.5,
    continuous: false,
    colliderCenter: new Vector(0, 0.35, 0),
    colliderSize: new Vector(1.8, 0.05, 0.05)
  }
]

class ObstacleManager implements Component {
  private count = 0;
  private obstacleGap = 6;
  private obstacleBufferLength = 10;
  private graceDistance = 25;
  private obstacleQueue: Entity[] = [];

  private player: Entity | null = null;

  start(ctx: ComponentContext) {
    this.player = ctx.tsgl.root.getChild("player")!;

    this.update(ctx);
  }

  update(ctx: ComponentContext) {
    let playerLocation = this.player!.position.z;

    while (this.obstacleQueue.length > 0 && this.obstacleQueue[0].position.z > playerLocation + this.obstacleGap) {
      ctx.tsgl.root.removeChild(this.obstacleQueue.shift()!);
    }

    while (this.obstacleQueue.length < this.obstacleBufferLength) {
      let lastObstacleLocation = this.obstacleQueue.length > 0 ? this.obstacleQueue[this.obstacleQueue.length - 1].position.z : -this.graceDistance;
      let newObstacleLocation = lastObstacleLocation - this.obstacleGap;
      let template = OBSTACLE_TEMPLATES[Math.floor(Math.random() * OBSTACLE_TEMPLATES.length)];
      let obstacle = this.instantiateObstacle(template, newObstacleLocation);

      ctx.tsgl.root.addChild(obstacle);
      this.obstacleQueue.push(obstacle);
    }
  }

  public checkCollision(collider: BoxCollider): boolean {
    for (let obstacle of this.obstacleQueue) {
      let obstacleCollider = obstacle.getComponent(BoxCollider)!;

      if (collider.intersects(obstacleCollider)) {
        return true;
      }
    }

    return false;
  }

  private instantiateObstacle(template: ObstacleTemplate, z: number): Entity {
    let entity = MODELS.get(template.model)!(`obstacle${this.count++}`);
    let a = template.continuous ? Math.random() : Math.round(Math.random());
    let x = a * (template.maxSpawnX - template.minSpawnX) + template.minSpawnX;
    let collider = new BoxCollider(template.colliderCenter, template.colliderSize);

    entity.addComponent(collider); // must be this order for proper collider relative position
    entity.position = new Vector(x, 0, z);

    return entity;
  }
}

export default ObstacleManager;