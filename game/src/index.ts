import TSGL from "tsgl";

import { Vector } from "tsgl/matrix";
import Light from "tsgl/light";
import Entity from "tsgl/entity";
import Cube from "tsgl/webgl/cube";

import CameraComponent from "./camera";

window.onload = async () => {
  let canvas = document.querySelector("canvas")!;
  let tsgl = new TSGL(canvas);
  tsgl.addLight(Light.point(new Vector(4, 6, 4), new Vector(1, 1, 1), 32));

  let bigCube = new Entity(new Cube());
  let smallCube = new Entity(new Cube());
  smallCube.scale = new Vector(0.25, 0.25, 0.25);
  smallCube.position = new Vector(0, 3, 0);

  tsgl.root.addChild(bigCube);
  tsgl.root.addChild(smallCube);
  tsgl.root.addComponent(new CameraComponent());

  const start = () => {
    canvas.removeEventListener("click", start);
    tsgl.start();
    (window as any).tsgl = tsgl; // for debugging
  };

  canvas.addEventListener("click", start);
}