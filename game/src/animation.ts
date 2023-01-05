import Component, { ComponentContext } from "tsgl/component";
import Entity from "tsgl/entity";
import { Vector } from "tsgl/matrix";

import { lerp } from "./util";

const ANIMATIONS = {
  run: {
    player: {
      from: [0, 0, 0],
      to: [0, 0, 0],
    },
    leftArmPivot: {
      from: [-Math.PI / 4, 0, 0],
      to: [Math.PI / 4, 0, 0],
    },
    rightArmPivot: {
      from: [Math.PI / 4, 0, 0],
      to: [-Math.PI / 4, 0, 0],
    },
    leftLegPivot: {
      from: [Math.PI / 4, 0, 0],
      to: [-Math.PI / 4, 0, 0],
    },
    rightLegPivot: {
      from: [-Math.PI / 4, 0, 0],
      to: [Math.PI / 4, 0, 0],
    }
  },
  slide: {
    player: {
      from: [0, 0, 0],
      to: [-Math.PI / 2, 0, 0],
    },
    headPivot: {
      from: [0, 0, 0],
      to: [Math.PI / 4, 0, 0]
    },
    leftArmPivot: {
      from: [0, 0, 0],
      to: [0, 0, Math.PI / 4],
    },
    rightArmPivot: {
      from: [0, 0, 0],
      to: [0, 0, -Math.PI / 4],
    },
    leftLegPivot: {
      from: [0, 0, 0],
      to: [0, 0, Math.PI / 12],
    },
    rightLegPivot: {
      from: [0, 0, 0],
      to: [0, 0, -Math.PI / 12],
    }
  }
}

class PlayerAnimation implements Component {
  private animation: keyof typeof ANIMATIONS | null = null;
  private animationTime = 0;
  public animationSpeed = 2;

  private cachedEntities: Map<string, Entity> = new Map();

  public playAnimation(name: keyof typeof ANIMATIONS, speed: number = 2) {
    this.animation = name;
    this.animationTime = 0;
    this.animationSpeed = speed;
  }

  public stopAnimation() {
    this.animation = null;
    this.animationTime = 0;
    this.animationSpeed = 2;
  }

  update(ctx: ComponentContext) {
    if (!this.animation) return;

    let animation: any = ANIMATIONS[this.animation];

    let a = 0.5 - 0.5 * Math.cos(this.animationTime * Math.PI * 2);

    for (let entityName of Object.keys(animation)) {
      if (!this.cachedEntities.has(entityName)) {
        this.cachedEntities.set(entityName, ctx.entity.find(entityName)!);
      }

      let from = animation[entityName].from;
      let to = animation[entityName].to;

      let rotation = new Vector(
        lerp(from[0], to[0], a),
        lerp(from[1], to[1], a),
        lerp(from[2], to[2], a)
      );

      let entity = this.cachedEntities.get(entityName)!;

      entity.rotation = rotation;
    }

    this.animationTime += ctx.deltaTime * this.animationSpeed;
  }
}

export default PlayerAnimation;