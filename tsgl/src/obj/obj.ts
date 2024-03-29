import ObjMesh from "./mesh";
import Material from "../material";

/**
 * A Wavefront OBJ file.
 */
class Obj {
  private source: string;

  private vertices: number[] = [];
  private normals: number[] = [];
  private textureCoordinates: number[] = [];
  private meshes: ObjMesh[] = [];
  private materials: Material[] = [];

  /**
   * Creates a blank object.
   * 
   * @param source The URL to assign to the file.
   */
  constructor(source: string) {
    this.source = source;

    this.vertices = [];
    this.normals = [];
    this.textureCoordinates = [];
    this.meshes = [];
    this.materials = [];
  }

  /**
   * Gets the meshes of the object.
   * 
   * @returns The constituent meshes of the object.
   */
  public getMeshes(): ObjMesh[] {
    return this.meshes;
  }

  /**
   * Loads an OBJ file from a URL.
   * 
   * @param source The URL to load the file from.
   * @returns A promise that resolves to the loaded object.
   */
  public static async parse(source: string): Promise<Obj> {
    let obj = new Obj(source);

    let data = await (await fetch(source)).text();

    let lines = data.split(/\r?\n/);

    for (let line of lines) {
      if (line.startsWith("#") || line === "") continue;

      let tokens = line.split(/\s+/);

      switch (tokens[0]) {
        case "v": obj.parseVertex(tokens); break;
        case "vn": obj.parseNormal(tokens); break;
        case "vt": obj.parseTextureCoordinate(tokens); break;
        case "f": obj.parseFace(tokens); break;

        case "mtllib": await obj.parseMaterial(tokens); break;
        case "usemtl": obj.newMesh(tokens); break;

        default: console.warn(`[obj] Ignoring unknown token \`${tokens[0]}\``);
      }
    }

    let totalTriangles = 0;
    for (let mesh of obj.meshes) {
      await mesh.finish();
      totalTriangles += mesh.getIndexCount() / 3;
    }

    console.log(`[obj] Loaded \`${source}\` with ${totalTriangles} triangles`)

    return obj;
  }

  /**
   * Parses a vertex from a line of the file, and adds it to the vertices array.
   */
  private parseVertex(tokens: string[]) {
    let x = parseFloat(tokens[1]);
    let y = parseFloat(tokens[2]);
    let z = parseFloat(tokens[3]);
    let w = tokens.length > 4 ? parseFloat(tokens[4]) : 1.0;

    this.vertices.push(x / w);
    this.vertices.push(y / w);
    this.vertices.push(z / w);
  }

  /**
   * Parses a normal from a line of the file, and adds it to the normals array.
   */
  private parseNormal(tokens: string[]) {
    let x = parseFloat(tokens[1]);
    let y = parseFloat(tokens[2]);
    let z = parseFloat(tokens[3]);

    this.normals.push(x);
    this.normals.push(y);
    this.normals.push(z);
  }

  /**
   * Parses a texture coordinate from a line of the file, and adds it to the texture coordinates array.
   */
  private parseTextureCoordinate(tokens: string[]) {
    let u = parseFloat(tokens[1]);
    let v = parseFloat(tokens[2]);

    this.textureCoordinates.push(u);
    this.textureCoordinates.push(v);
  }

  /**
   * Parses a face from a line of the file, and adds it to the current mesh.
   */
  private parseFace(tokens: string[]) {
    let meshIndex = this.meshes.length - 1;

    if (meshIndex === -1) {
      this.meshes.push(new ObjMesh(new Material()));
      meshIndex = 0;
    }

    if (tokens.length !== 4) {
      console.warn(`[obj] Ignoring face with ${tokens.length - 1} vertices, only triangles are supported`);
      return;
    }

    for (let i = 1; i < 4; i++) {
      let vertexTokens = tokens[i].split("/");
      let vertexIndex = parseInt(vertexTokens[0]) - 1;
      let textureCoordinateIndex = parseInt(vertexTokens[1]) - 1;
      let normalIndex = parseInt(vertexTokens[2]) - 1;

      let vertex = this.vertices.slice(vertexIndex * 3, vertexIndex * 3 + 3);
      let normal = this.normals.slice(normalIndex * 3, normalIndex * 3 + 3);
      let textureCoordinate = this.textureCoordinates.slice(textureCoordinateIndex * 2, textureCoordinateIndex * 2 + 2);

      this.meshes[meshIndex].addVertex(vertex, normal, textureCoordinate);
    }
  }

  /**
   * Loads a material from a URL specified in a line of the file.
   */
  private async parseMaterial(tokens: string[]) {
    let directory = this.source.split("/").slice(0, -1).join("/");
    let materialSource = `${directory}/${tokens[1]}`;
    let materials = await Material.parse(materialSource);
    this.materials.push(...materials);
  }

  /**
   * Creates a new mesh as specified by a line of the file.
   */
  private newMesh(tokens: string[]) {
    let materialName = tokens[1];
    let material = this.materials.find(material => material.name === materialName);

    if (!material) throw new Error("Undefined material");

    this.meshes.push(new ObjMesh(material));
  }
}

export default Obj;