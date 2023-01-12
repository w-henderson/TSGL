import Mesh from './mesh';

/**
 * An empty mesh.
 */
class Empty extends Mesh {
  constructor() {
    super();
    this.initialize();
  }

  initializeVertexPositions() { return []; }
  initializeVertexIndices() { return []; }
  initializeVertexNormals() { return []; }
  initializeTextureCoordinates() { return []; }

  initialize() { }

  render() { }
}

export default Empty;