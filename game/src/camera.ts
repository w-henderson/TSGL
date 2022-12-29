import Component, { ComponentContext } from "tsgl/component";
import { Vector } from "tsgl/matrix";

class CameraFollowComponent implements Component {
  private lerp(a: Vector, b: Vector, t: number) {
    return a.scale(1 - t).add(b.scale(t));
  }

  update(ctx: ComponentContext) {
    let target = ctx.tsgl.root.getChild("Kart")!;
    ctx.tsgl.camera.lookAt(target.position.add(new Vector(0, 1, 0)));

    let cameraFollowPosition = target.position.add(target.right().scale(-5)).add(new Vector(0, 4, 0));

    ctx.tsgl.camera.position = this.lerp(ctx.tsgl.camera.position, cameraFollowPosition, 0.1);
  }
}

export default CameraFollowComponent;