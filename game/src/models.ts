import Obj from "tsgl/obj/obj";
import ObjMesh from "tsgl/obj/mesh";
import Entity from "tsgl/entity";
import Empty from "tsgl/webgl/empty";

import { Vector } from "tsgl/matrix";

const sources = [
  "assets/models/Kart.obj",
  "assets/models/SteeringWheel.obj",
  "assets/models/Wheel.obj"
];

const models: Map<string, ObjMesh[]> = new Map();

export async function loadModels() {
  for (let source of sources) {
    let object = await Obj.parse(source);
    let meshes = object.getMeshes();
    models.set(source, meshes);
  }
}

export function instantiateKart(name?: string): Entity {
  let kart = new Entity(new Empty(), name);

  let chassis = entityWithMultipleMeshes(models.get("assets/models/Kart.obj")!, "Chassis");
  let frontLeftWheel = entityWithMultipleMeshes(models.get("assets/models/Wheel.obj")!, "FrontLeftWheel");
  let frontRightWheel = entityWithMultipleMeshes(models.get("assets/models/Wheel.obj")!, "FrontRightWheel");
  let steeringWheel = entityWithMultipleMeshes(models.get("assets/models/SteeringWheel.obj")!, "SteeringWheel");

  frontLeftWheel.position = new Vector(-0.93055, 0.29428, 0.81895);
  frontRightWheel.position = new Vector(-0.93055, 0.29428, -0.81895);
  frontRightWheel.rotation = new Vector(0, Math.PI, 0);

  steeringWheel.position = new Vector(-0.64835, 1.11915, 0.0258);

  kart.addChild(chassis, frontLeftWheel, frontRightWheel, steeringWheel);

  return kart;
}

function entityWithMultipleMeshes(meshes: ObjMesh[], name?: string): Entity {
  let entity = new Entity(new Empty(), name);
  for (let mesh of meshes) {
    entity.addChild(new Entity(mesh));
  }
  return entity;
}