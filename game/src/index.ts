import TSGL from "tsgl";

import { Vector } from "tsgl/matrix";
import Light from "tsgl/light";
import BoxCollider from "tsgl/physics/boxcollider";

import PlayerController from "./player";
import PlayerAnimation from "./animation";
import RoadLoader from "./road";
import ObstacleManager from "./obstacles";
import GameManager from "./manager";
import InputManager from "./input";

import { loadModels, playerModel } from "./models";

window.onload = async () => {
  let canvas = document.querySelector("canvas")!;
  let devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;

  let tsgl = new TSGL(canvas);
  tsgl.addLight(Light.directional(new Vector(-1, -3, -1), new Vector(1, 1, 1), 1));

  await loadModels();

  let player = playerModel();
  player.addComponent(new BoxCollider(new Vector(0, 0, 0), new Vector(0.25, 1, 0.1)));
  player.addComponent(new InputManager());
  player.addComponent(new PlayerController());
  player.addComponent(new PlayerAnimation());
  player.position = new Vector(2.5, 0.3125, -2);
  tsgl.root.addChild(player);

  tsgl.camera.position = new Vector(2.7, 0.5, -1.2);
  tsgl.camera.azimuth = Math.PI / 2;
  tsgl.camera.elevation = -0.1;
  tsgl.camera.fov = Math.PI / 3;
  tsgl.camera.fogDensity = 0.06;
  tsgl.camera.fogColor = new Vector(0.75, 1, 1);
  tsgl.camera.background = new Vector(0.75, 1, 1);

  tsgl.root.addComponent(new GameManager());
  tsgl.root.addComponent(new RoadLoader());
  tsgl.root.addComponent(new ObstacleManager());

  window.onresize = () => {
    let canvas = document.querySelector("canvas")!;
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    tsgl.camera.aspect = canvas.height / canvas.width;
  }

  (window as any).tsgl = tsgl; // for debugging

  tsgl.start();
}

