import TSGL from "./lib";
import Obj from "./obj/obj";
import Texture from "./webgl/texture";
import { Vector } from "./matrix";
import Entity from "./entity";
import Cube from "./webgl/cube";
import Component, { ComponentContext } from "./component";

class GameManagerComponent implements Component {
  private canvas: HTMLCanvasElement;

  private keysDown = new Set<string>();
  private movementSpeed = 0.1;
  private mouseSensitivity = 0.002;

  private deltaAzimuth = 0;
  private deltaElevation = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onKeyDown(e: KeyboardEvent) {
    this.keysDown.add(e.key);
  }

  onKeyUp(e: KeyboardEvent) {
    this.keysDown.delete(e.key);
  }

  onMouseMove(e: MouseEvent) {
    this.deltaAzimuth -= e.movementX * this.mouseSensitivity;
    this.deltaElevation -= e.movementY * this.mouseSensitivity;
  }

  start(ctx: ComponentContext) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.canvas.onclick = () => this.canvas.requestPointerLock();
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.canvas) {
        console.log("[pointerlockchange] pointer locked");
        document.addEventListener("mousemove", this.onMouseMove, false);
      } else {
        console.log("[pointerlockchange] pointer unlocked");
        document.removeEventListener("mousemove", this.onMouseMove, false);
      }
    }, false);
  }

  update(ctx: ComponentContext) {
    let keysDirection = [
      (this.keysDown.has("w") ? 1 : 0) - (this.keysDown.has("s") ? 1 : 0),
      (this.keysDown.has("d") ? 1 : 0) - (this.keysDown.has("a") ? 1 : 0),
      (this.keysDown.has("e") ? 1 : 0) - (this.keysDown.has("q") ? 1 : 0)
    ];

    ctx.tsgl.camera.position = ctx.tsgl.camera.position
      .add(ctx.tsgl.camera.getDirection().scale(-keysDirection[0] * this.movementSpeed))
      .add(ctx.tsgl.camera.getRight().scale(keysDirection[1] * this.movementSpeed))
      .add(new Vector(0, 1, 0).scale(keysDirection[2] * this.movementSpeed));

    ctx.tsgl.camera.azimuth += this.deltaAzimuth;
    ctx.tsgl.camera.elevation += this.deltaElevation;
    this.deltaAzimuth = 0;
    this.deltaElevation = 0;
  }
}

class CubeRotationComponent implements Component {
  update(ctx: ComponentContext) {
    ctx.entity.rotate(new Vector(0, 0.01, 0));
  }
}

window.onload = async () => {
  let canvas = document.querySelector("canvas")!;
  let tsgl = new TSGL(canvas);

  let bigCube = new Entity(new Cube());
  bigCube.scale = new Vector(2, 2, 2);

  let littleCube1 = new Entity(new Cube());
  let littleCube2 = new Entity(new Cube());
  littleCube1.position = new Vector(-4, 0, 0);
  littleCube2.position = new Vector(4, 0, 0);

  bigCube.addChild(littleCube1, littleCube2);
  bigCube.addComponent(new CubeRotationComponent());

  tsgl.root.addChild(bigCube);
  tsgl.root.addComponent(new GameManagerComponent(canvas));

  tsgl.start();
}