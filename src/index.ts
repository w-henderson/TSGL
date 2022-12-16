import TSGL from "./lib";
import Obj from "./obj/obj";
import Entity from "./webgl/entity";
import Texture from "./webgl/texture";
import { Vector } from "./matrix";

window.onload = async () => {
  let canvas = document.querySelector("canvas")!;
  let tsgl = new TSGL(canvas);
  let chicken = await Obj.parse(tsgl.getCtx(), "models/chicken.obj");
  let meshes = chicken.getMeshes();
  console.log(meshes);
  let entities = meshes.map(mesh => new Entity(tsgl.getCtx(), mesh, new Texture(tsgl.getCtx())));
  tsgl.addEntity(...entities);

  let keysDown = new Set<string>();

  window.addEventListener("keydown", e => {
    keysDown.add(e.key);

    if (e.key === " ") {
      console.log(`position: ${tsgl.camera.position.toString()}`);
      console.log(`azimuth: ${tsgl.camera.azimuth}, elevation: ${tsgl.camera.elevation}`);
      console.log(`direction: ${tsgl.camera.getDirection().toString()}`);
      console.log(`up: ${tsgl.camera.getUp().toString()}`);
      console.log(`right: ${tsgl.camera.getRight().toString()}`);
    }
  });

  window.addEventListener("keyup", e => {
    keysDown.delete(e.key);
  });

  const movementSpeed = 0.1;
  const mouseSensitivity = 0.002;

  const mouseMoveCallback = (e: MouseEvent) => {
    tsgl.camera.azimuth -= e.movementX * mouseSensitivity;
    tsgl.camera.elevation -= e.movementY * mouseSensitivity;
  }

  canvas.onclick = () => canvas.requestPointerLock();
  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === canvas) {
      console.log("[pointerlockchange] pointer locked")
      document.addEventListener("mousemove", mouseMoveCallback, false);
    } else {
      console.log("[pointerlockchange] pointer unlocked")
      document.removeEventListener("mousemove", mouseMoveCallback, false);
    }
  }, false)

  const animation = () => {
    let keysDirection = [
      (keysDown.has("w") ? 1 : 0) - (keysDown.has("s") ? 1 : 0),
      (keysDown.has("d") ? 1 : 0) - (keysDown.has("a") ? 1 : 0),
      (keysDown.has("e") ? 1 : 0) - (keysDown.has("q") ? 1 : 0)
    ];

    tsgl.camera.position = tsgl.camera.position
      .add(tsgl.camera.getDirection().scale(-keysDirection[0] * movementSpeed))
      .add(tsgl.camera.getRight().scale(keysDirection[1] * movementSpeed))
      .add(new Vector(0, 1, 0).scale(keysDirection[2] * movementSpeed));

    tsgl.render();
    window.requestAnimationFrame(animation);
  }

  window.requestAnimationFrame(animation);
}