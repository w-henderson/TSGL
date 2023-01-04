import Component, { ComponentContext } from "tsgl/component";
import Entity from "tsgl/entity";
import { Vector } from "tsgl/matrix";

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
      to: [Math.PI / 2, 0, 0],
    },
    headPivot: {
      from: [0, 0, 0],
      to: [-Math.PI / 4, 0, 0]
    },
    leftArmPivot: {
      from: [0, 0, 0],
      to: [0, 0, 0],
    },
    rightArmPivot: {
      from: [0, 0, 0],
      to: [0, 0, 0],
    },
    leftLegPivot: {
      from: [0, 0, 0],
      to: [0, 0, 0],
    },
    rightLegPivot: {
      from: [0, 0, 0],
      to: [0, 0, 0],
    }
  }
}

class PlayerAnimation implements Component {
  private animation: keyof typeof ANIMATIONS = "run";
  private animationTime = 0;
  public animationSpeed = 2;

  private cachedEntities: Map<string, Entity> = new Map();

  public playAnimation(name: keyof typeof ANIMATIONS, speed: number = 2) {
    this.animation = name;
    this.animationTime = 0;
    this.animationSpeed = speed;
  }

  update(ctx: ComponentContext) {
    let animation: any = ANIMATIONS[this.animation];

    let a = 0.5 - 0.5 * Math.cos(this.animationTime * Math.PI * 2);

    for (let entityName of Object.keys(animation)) {
      if (!this.cachedEntities.has(entityName)) {
        this.cachedEntities.set(entityName, ctx.entity.find(entityName)!);
      }

      let from = animation[entityName].from;
      let to = animation[entityName].to;

      let rotation = new Vector(
        this.lerp(from[0], to[0], a),
        this.lerp(from[1], to[1], a),
        this.lerp(from[2], to[2], a)
      );

      let entity = this.cachedEntities.get(entityName)!;

      entity.rotation = rotation;
    }

    this.animationTime += ctx.deltaTime * this.animationSpeed;
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }
}

export default PlayerAnimation;