import Entity from "tsgl/entity";
import Obj from "tsgl/obj/obj";
import Empty from "tsgl/webgl/empty";

const sources = [
  "assets/models/bridge.obj",
  "assets/models/road.obj",
  "assets/models/car.obj",
  "assets/models/lorry.obj",
  "assets/models/cones.obj",
  "assets/models/barrier.obj"
];

export const MODELS = new Map<string, (name: string) => Entity>();

export async function loadModels() {
  for (let source of sources) {
    let obj = await Obj.parse(source);
    let meshes = obj.getMeshes();

    MODELS.set(source, (name: string) => {
      let entities = meshes.map((mesh, i) => new Entity(mesh, `${name}_${i}`));
      let entity = new Entity(new Empty(), name);
      entity.addChild(...entities);

      return entity;
    });
  }
}