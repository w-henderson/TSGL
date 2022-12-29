import TSGL from "tsgl";

import { Vector } from "tsgl/matrix";
import Light from "tsgl/light";

import CameraFollowComponent from "./camera";
import DrivingComponent from "./driving";
import { instantiateKart, loadModels } from "./models";

window.onload = async () => {
  let canvas = document.querySelector("canvas")!;
  let tsgl = new TSGL(canvas);
  tsgl.addLight(Light.directional(new Vector(0, -4, -2), new Vector(1, 1, 1), 4));

  await loadModels();

  let kart = instantiateKart("Kart");
  kart.addComponent(new DrivingComponent());
  tsgl.root.addChild(kart);
  tsgl.root.addComponent(new CameraFollowComponent());

  const start = () => {
    canvas.removeEventListener("click", start);
    tsgl.start();
    (window as any).tsgl = tsgl; // for debugging
  };

  canvas.addEventListener("click", start);
}