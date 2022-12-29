import TSGL from "tsgl";

import { Vector } from "tsgl/matrix";
import Entity from "tsgl/entity";
import Component, { ComponentContext } from "tsgl/component";
import AudioComponent from "tsgl/audio";
import Light from "tsgl/light";

import { instantiateKart, loadModels } from "./models";

class GameManagerComponent implements Component {
  private movementSpeed = 0.1;
  private mouseSensitivity = 0.002;

  update(ctx: ComponentContext) {
    let forward = ctx.tsgl.input.getAxis("vertical");
    let right = ctx.tsgl.input.getAxis("horizontal");
    let up = ctx.tsgl.input.getAxis("roll");

    ctx.tsgl.camera.position = ctx.tsgl.camera.position
      .add(ctx.tsgl.camera.getDirection().scale(forward * this.movementSpeed))
      .add(ctx.tsgl.camera.getRight().scale(right * this.movementSpeed))
      .add(new Vector(0, 1, 0).scale(up * this.movementSpeed));

    let { x, y } = ctx.tsgl.input.getMouseDelta();
    ctx.tsgl.camera.azimuth -= x * this.mouseSensitivity;
    ctx.tsgl.camera.elevation -= y * this.mouseSensitivity;
  }
}

window.onload = async () => {
  let canvas = document.querySelector("canvas")!;
  let tsgl = new TSGL(canvas);
  tsgl.addLight(Light.directional(new Vector(0, -4, -2), new Vector(1, 1, 1), 4));

  await loadModels();

  let kart = instantiateKart();
  tsgl.root.addChild(kart);
  tsgl.root.addComponent(new GameManagerComponent());

  const start = () => {
    canvas.removeEventListener("click", start);
    tsgl.start();
    (window as any).tsgl = tsgl; // for debugging
  };

  canvas.addEventListener("click", start);
}