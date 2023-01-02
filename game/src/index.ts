import TSGL from "tsgl";

import { Vector } from "tsgl/matrix";
import Light from "tsgl/light";
import Entity from "tsgl/entity";
import Cube from "tsgl/webgl/cube";

import CameraComponent from "./camera";
import PlayerController from "./player";
import RoadLoader from "./road";

import { loadModels, MODELS } from "./models";

window.onload = async () => {
  let canvas = document.querySelector("canvas")!;
  let tsgl = new TSGL(canvas);
  tsgl.addLight(Light.directional(new Vector(-1, -3, -1), new Vector(1, 1, 1), 1));

  await loadModels();

  let player = new Entity(new Cube(), "player");
  player.scale = new Vector(0.1, 0.25, 0.1);
  player.position = new Vector(2.5, 0.25, 0);
  player.addComponent(new PlayerController());
  tsgl.root.addChild(player);

  tsgl.camera.azimuth = Math.PI / 2;
  tsgl.camera.elevation = -0.1;
  tsgl.camera.fov = Math.PI / 3;
  tsgl.camera.fogDensity = 0.06;
  tsgl.camera.fogColor = new Vector(0.75, 1, 1);
  tsgl.camera.background = new Vector(0.75, 1, 1);

  tsgl.root.addComponent(new RoadLoader());

  (window as any).tsgl = tsgl; // for debugging

  tsgl.start();
}