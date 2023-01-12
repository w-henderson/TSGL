import Component, { ComponentContext } from "./component";
import TSGL from "./index";
import Light from "./light";
import Material from "./material";
import { Matrix } from "./matrix";
import Mesh from "./webgl/mesh";
import ShaderProgram from "./webgl/program";

class MeshComponent implements Component {
  private meshes: Mesh[];
  private shader: ShaderProgram;

  constructor(meshes: Mesh[], shader?: ShaderProgram) {
    this.meshes = meshes;
    this.shader = shader || ShaderProgram.getDefaultProgram();
  }

  public getMesh(): Mesh | undefined {
    return this.meshes.length === 1 ? this.meshes[0] : undefined;
  }

  public getMeshes(): Mesh[] {
    return this.meshes;
  }

  public getMaterial(): Material | undefined {
    return this.getMesh()?.getMaterial();
  }

  public getMaterials(): Material[] {
    return this.meshes.map(mesh => mesh.getMaterial());
  }

  public render(tsgl: TSGL, matrix: Matrix) {
    if (this.shader.useProgram()) {
      console.log(`first bind of stuff for frame ${TSGL.currentFrame}`);
      tsgl.camera.position.uploadToShader(this.shader, "wc_camera_position");
      Light.uploadToShader(tsgl.lights, this.shader);
    }

    for (let mesh of this.meshes) {
      mesh.render(tsgl.camera, matrix, this.shader);
    }
  }

  start(ctx: ComponentContext) { }
}

export default MeshComponent;