import Entity from "tsgl/entity";
import Obj from "tsgl/obj/obj";

import Cube from "tsgl/webgl/cube"
import Empty from "tsgl/webgl/empty";

import { Vector } from "tsgl/matrix";

const sources = [
  "assets/models/bridge.obj",
  "assets/models/road.obj",
  "assets/models/field.obj",
  "assets/models/car.obj",
  "assets/models/lorry.obj",
  "assets/models/cones.obj",
  "assets/models/barrier.obj"
];

export const MODELS = new Map<string, (name: string) => Entity>();

type LoadedObject = {
  source: string,
  object: Obj
};

export async function loadModels() {
  let objects = await Promise.all(sources.map(source => new Promise<LoadedObject>(async res => res({
    source,
    object: await Obj.parse(source)
  }))));

  for (let obj of objects) {
    let meshes = obj.object.getMeshes();

    MODELS.set(obj.source, (name: string) => {
      let entities = meshes.map((mesh, i) => new Entity(mesh, `${name}_${i}`));
      let entity = new Entity(new Empty(), name);
      entity.addChild(...entities);

      return entity;
    });
  }
}

export function playerModel(): Entity {
  const scalingFactor = 0.125;

  let player = new Entity(new Empty(), "player");

  let body = new Entity(new Cube(), "body");

  let headPivot = new Entity(new Empty(), "headPivot");
  let head = new Entity(new Cube(), "head");

  let leftArmPivot = new Entity(new Empty(), "leftArmPivot");
  let leftArm = new Entity(new Cube(), "leftArm");
  let rightArmPivot = new Entity(new Empty(), "rightArmPivot");
  let rightArm = new Entity(new Cube(), "rightArm");

  let leftLegPivot = new Entity(new Empty(), "leftLegPivot");
  let leftLeg = new Entity(new Cube(), "leftLeg");
  let rightLegPivot = new Entity(new Empty(), "rightLegPivot");
  let rightLeg = new Entity(new Cube(), "rightLeg");

  body.scale = new Vector(1, 2, 0.5).scale(scalingFactor * 0.5);
  head.scale = new Vector(1, 1, 1).scale(scalingFactor * 0.5);

  leftArm.scale = new Vector(0.5, 1.5, 0.5).scale(scalingFactor * 0.5);
  rightArm.scale = new Vector(0.5, 1.5, 0.5).scale(scalingFactor * 0.5);
  leftLeg.scale = new Vector(0.5, 1.5, 0.5).scale(scalingFactor * 0.5);
  rightLeg.scale = new Vector(0.5, 1.5, 0.5).scale(scalingFactor * 0.5);

  headPivot.position = new Vector(0, 1, 0).scale(scalingFactor);
  head.position = new Vector(0, 0.5, 0).scale(scalingFactor);

  leftArmPivot.position = new Vector(-0.5, 1, 0).scale(scalingFactor);
  rightArmPivot.position = new Vector(0.5, 1, 0).scale(scalingFactor);
  leftArm.position = new Vector(-0.25, -0.75, 0).scale(scalingFactor);
  rightArm.position = new Vector(0.25, -0.75, 0).scale(scalingFactor);

  leftLegPivot.position = new Vector(-0.25, -1, 0).scale(scalingFactor);
  rightLegPivot.position = new Vector(0.25, -1, 0).scale(scalingFactor);
  leftLeg.position = new Vector(0, -0.75, 0).scale(scalingFactor);
  rightLeg.position = new Vector(0, -0.75, 0).scale(scalingFactor);

  let red = [1, 0.175, 0.175];
  let blue = [0.25, 0.25, 1];

  body.getMaterial().kd = red;
  leftArm.getMaterial().kd = red;
  rightArm.getMaterial().kd = red;
  leftLeg.getMaterial().kd = blue;
  rightLeg.getMaterial().kd = blue;

  headPivot.addChild(head);

  leftArmPivot.addChild(leftArm);
  rightArmPivot.addChild(rightArm);

  leftLegPivot.addChild(leftLeg);
  rightLegPivot.addChild(rightLeg);

  player.addChild(body, headPivot, leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot);

  return player;
}