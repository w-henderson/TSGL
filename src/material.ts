class Material {
  public name: string = "default";

  public ns: number = 0;
  public ka: number[] = [1, 1, 1];
  public kd: number[] = [1, 1, 1];
  public ks: number[] = [1, 1, 1];
  public ke: number[] = [0, 0, 0];
  public ni: number = 1;
  public d: number = 1;
  public illum: number = 2;

  // TODO: texture maps

  constructor() { }

  public static withName(name: string): Material {
    let material = new Material();
    material.name = name;
    return material;
  }

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

        default: console.warn(`[mtl] Ignoring unknown token \`${tokens[0]}\``);
      }
    }

    return materials;
  }

  public static parseColor(tokens: string[]): number[] {
    let r = parseFloat(tokens[1]);
    let g = parseFloat(tokens[2]);
    let b = parseFloat(tokens[3]);

    return [r, g, b];
  }
}

export default Material;