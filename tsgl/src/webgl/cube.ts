import Mesh from './mesh';

/**
 * A cube mesh.
 * 
 * The cube is 2x2x2 and is centered on the origin.
 */
class Cube extends Mesh {
  constructor() {
    super();
    this.initialize();
  }

  initializeVertexPositions(): number[] {
    return [
      -1, 1, -1, -1, 1, 1, 1, 1, -1,
      -1, 1, 1, 1, 1, 1, 1, 1, -1,
      -1, -1, 1, -1, -1, -1, 1, -1, 1,
      -1, -1, -1, 1, -1, -1, 1, -1, 1,
      -1, 1, 1, -1, -1, 1, 1, 1, 1,
      -1, -1, 1, 1, -1, 1, 1, 1, 1,
      -1, -1, -1, -1, 1, -1, 1, -1, -1,
      -1, 1, -1, 1, 1, -1, 1, -1, -1,
      -1, -1, -1, -1, -1, 1, -1, 1, -1,
      -1, -1, 1, -1, 1, 1, -1, 1, -1,
      1, 1, -1, 1, 1, 1, 1, -1, -1,
      1, 1, 1, 1, -1, 1, 1, -1, -1
    ];
  }

  initializeVertexIndices(): number[] {
    return [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
    ];
  }

  initializeVertexNormals(): number[] {
    return [
      0, 1, 0, 0, 1, 0, 0, 1, 0,
      0, 1, 0, 0, 1, 0, 0, 1, 0,
      0, -1, 0, 0, -1, 0, 0, -1, 0,
      0, -1, 0, 0, -1, 0, 0, -1, 0,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, 0, -1, 0, 0, -1, 0, 0, -1,
      -1, 0, 0, -1, 0, 0, -1, 0, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 0,
      1, 0, 0, 1, 0, 0, 1, 0, 0,
      1, 0, 0, 1, 0, 0, 1, 0, 0
    ];
  }

  initializeTextureCoordinates(): number[] {
    return [
      1 / 4, 0, 1 / 4, 1 / 3, 1 / 2, 0,
      1 / 4, 1 / 3, 1 / 2, 1 / 3, 1 / 2, 0,
      1 / 4, 2 / 3, 1 / 4, 1, 1 / 2, 2 / 3,
      1 / 4, 1, 1 / 2, 1, 1 / 2, 2 / 3,
      1 / 4, 1 / 3, 1 / 4, 2 / 3, 1 / 2, 1 / 3,
      1 / 4, 2 / 3, 1 / 2, 2 / 3, 1 / 2, 1 / 3,
      1, 2 / 3, 1, 1 / 3, 3 / 4, 2 / 3,
      1, 1 / 3, 3 / 4, 1 / 3, 3 / 4, 2 / 3,
      0, 2 / 3, 1 / 4, 2 / 3, 0, 1 / 3,
      1 / 4, 2 / 3, 1 / 4, 1 / 3, 0, 1 / 3,
      3 / 4, 1 / 3, 1 / 2, 1 / 3, 3 / 4, 2 / 3,
      1 / 2, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 2 / 3
    ];
  }
}

export default Cube;