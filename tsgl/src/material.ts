import TSGL from ".";

import ShaderProgram from "./webgl/program";
import Texture from "./webgl/texture";

/**
 * A material.
 */
class Material {
  public name: string = "default";

  /** The specular exponent. */
  public ns: number = 32;
  /** The ambient coefficient. */
  public ka: number[] = [1, 1, 1];
  /** The diffuse coefficient. */
  public kd: number[] = [1, 1, 1];
  /** The specular coefficient. */
  public ks: number[] = [1, 1, 1];
  /** The emissive coefficient. */
  public ke: number[] = [0, 0, 0];
  /** The optical density. */
  public ni: number = 1;
  /** The opacity. */
  public d: number = 1;
  /** The illumination model. */
  public illum: number = 2;

  /** The diffuse texture. */
  public mapKd: Texture | null = null;

  constructor() { }

  /**
   * Creates a new named material.
   * 
   * @param name The name of the material.
   * @returns The new material.
   */
  public static withName(name: string): Material {
    let material = new Material();
    material.name = name;
    return material;
  }

  /**
   * Parses the materials from an MTL file.
   * 
   * @param source The URL to the MTL file.
   * @returns A promise that resolves to an array of materials defined in the MTL file.
   */
  public static async parse(source: string): Promise<Material[]> {
    let materials = [];
    let data = await (await fetch(source)).text();
    let lines = data.split(/\r?\n/);

    for (let line of lines) {
      if (line.startsWith("#") || line === "") continue;

      let tokens = line.split(/\s+/);

      let index = materials.length - 1;

      switch (tokens[0]) {
        case "newmtl": materials.push(Material.withName(tokens[1])); break;
        case "Ns": materials[index].ns = parseFloat(tokens[1]); break;
        case "Ka": materials[index].ka = Material.parseColor(tokens); break;
        case "Kd": materials[index].kd = Material.parseColor(tokens); break;
        case "Ks": materials[index].ks = Material.parseColor(tokens); break;
        case "Ke": materials[index].ke = Material.parseColor(tokens); break;
        case "Ni": materials[index].ni = parseFloat(tokens[1]); break;
        case "d": materials[index].d = parseFloat(tokens[1]); break;
        case "illum": materials[index].illum = parseFloat(tokens[1]); break;

        case "map_Kd": materials[index].mapKd = Material.parseTexture(source, tokens[1]); break;

        default: console.warn(`[mtl] Ignoring unknown token \`${tokens[0]}\``);
      }
    }

    return materials;
  }

  /**
   * Parses an RGB colour.
   */
  public static parseColor(tokens: string[]): number[] {
    let r = parseFloat(tokens[1]);
    let g = parseFloat(tokens[2]);
    let b = parseFloat(tokens[3]);

    return [r, g, b];
  }

  /**
   * Parses (but does not yet load) an external texture.
   * 
   * @param source The source of the MTL file.
   * @param texSource The source of the texture file.
   * @returns The texture object.
   */
  public static parseTexture(source: string, texSource: string): Texture {
    let directory = source.split("/").slice(0, -1).join("/");
    let materialSource = `${directory}/${texSource}`;
    return new Texture(materialSource);
  }

  /**
   * Uploads the material to a shader.
   * 
   * @param program The shader program.
   */
  public uploadToShader(program: ShaderProgram) {
    let colours = { ka: this.ka, kd: this.kd, ks: this.ks, ke: this.ke };
    let floats = { ns: this.ns, ni: this.ni, d: this.d, illum: this.illum };

    for (let key in colours) {
      let location = program.getUniformLocation(key)!;
      let colour: number[] = (colours as any)[key];
      TSGL.gl.uniform3f(location, colour[0], colour[1], colour[2]);
    }

    for (let key in floats) {
      let location = program.getUniformLocation(key)!;
      let value: number = (floats as any)[key];
      TSGL.gl.uniform1f(location, value);
    }
  }
}

export default Material;