import TSGL from ".";

import ShaderProgram from "./webgl/program";

export class Matrix {
  private data: Float32Array;
  private rows: number;
  private columns: number;

  /**
   * Creates a new matrix.
   * 
   * If the matrix is square, this will be an identity matrix.
   * Otherwise, it will be filled with zeros.
   * 
   * @param rows The number of rows in the matrix.
   * @param columns The number of columns in the matrix.
   */
  constructor(rows: number, columns: number) {
    this.data = new Float32Array(rows * columns);
    this.rows = rows;
    this.columns = columns;

    if (rows === columns) {
      for (let i = 0; i < rows; i++) {
        this.data[i * rows + i] = 1;
      }
    }
  }

  /**
   * Creates a square matrix from an array.
   * 
   * @param data The size*size array of numbers to use as the matrix data.
   * @param size The size of the matrix. If not specified, it will be calculated from the length of the array.
   * @returns The matrix.
   */
  public static squareFromArray(data: number[], size?: number): Matrix {
    size = size || Math.sqrt(data.length);
    if (size !== Math.floor(size)) {
      throw new Error("Array must have a square number of elements");
    }

    let result = new Matrix(size, size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        result.data[i * size + j] = data[i * size + j];
      }
    }

    return result;
  }

  /**
   * Multiplies by a given matrix.
   * 
   * @param rhs The matrix to multiply by.
   * @returns The result of the multiplication.
   */
  public mul(rhs: Matrix): Matrix {
    if (this.columns !== rhs.rows) {
      throw new Error("Matrix dimensions must agree");
    }

    let result = new Matrix(this.rows, rhs.columns);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < rhs.columns; j++) {
        let sum = 0;
        for (let k = 0; k < this.columns; k++) {
          sum += this.data[i * this.columns + k] * rhs.data[k * rhs.columns + j];
        }
        result.data[i * rhs.columns + j] = sum;
      }
    }

    return result;
  }

  /**
   * Multiplies by a given vector.
   * 
   * @param vector The vector to multiply by.
   * @returns The result of the multiplication.
   */
  public mulVector(vector: Vector): Vector {
    return new Vector(
      this.data[0] * vector.x + this.data[1] * vector.y + this.data[2] * vector.z + this.data[3],
      this.data[4] * vector.x + this.data[5] * vector.y + this.data[6] * vector.z + this.data[7],
      this.data[8] * vector.x + this.data[9] * vector.y + this.data[10] * vector.z + this.data[11]
    )
  }

  /**
   * Adds a given matrix.
   * 
   * @param rhs The matrix to add.
   * @returns The result of the addition.
   */
  public add(rhs: Matrix): Matrix {
    if (this.rows !== rhs.rows || this.columns !== rhs.columns) {
      throw new Error("Matrix dimensions must agree");
    }

    let result = new Matrix(this.rows, this.columns);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        result.data[i * this.columns + j] = this.data[i * this.columns + j] + rhs.data[i * this.columns + j];
      }
    }

    return result;
  }

  /**
   * Inverts a 4x4 matrix.
   * 
   * [source](https://evanw.github.io/lightgl.js/docs/matrix.html)
   * 
   * @returns The inverted matrix.
   */
  public invert(): Matrix {
    if (this.rows !== 4 || this.columns !== 4) {
      throw new Error("Not implemented for this matrix type");
    }

    let result = new Matrix(4, 4);
    let m = this.data;
    let r = result.data;

    r[0] = m[5] * m[10] * m[15] - m[5] * m[14] * m[11] - m[6] * m[9] * m[15] + m[6] * m[13] * m[11] + m[7] * m[9] * m[14] - m[7] * m[13] * m[10];
    r[1] = -m[1] * m[10] * m[15] + m[1] * m[14] * m[11] + m[2] * m[9] * m[15] - m[2] * m[13] * m[11] - m[3] * m[9] * m[14] + m[3] * m[13] * m[10];
    r[2] = m[1] * m[6] * m[15] - m[1] * m[14] * m[7] - m[2] * m[5] * m[15] + m[2] * m[13] * m[7] + m[3] * m[5] * m[14] - m[3] * m[13] * m[6];
    r[3] = -m[1] * m[6] * m[11] + m[1] * m[10] * m[7] + m[2] * m[5] * m[11] - m[2] * m[9] * m[7] - m[3] * m[5] * m[10] + m[3] * m[9] * m[6];

    r[4] = -m[4] * m[10] * m[15] + m[4] * m[14] * m[11] + m[6] * m[8] * m[15] - m[6] * m[12] * m[11] - m[7] * m[8] * m[14] + m[7] * m[12] * m[10];
    r[5] = m[0] * m[10] * m[15] - m[0] * m[14] * m[11] - m[2] * m[8] * m[15] + m[2] * m[12] * m[11] + m[3] * m[8] * m[14] - m[3] * m[12] * m[10];
    r[6] = -m[0] * m[6] * m[15] + m[0] * m[14] * m[7] + m[2] * m[4] * m[15] - m[2] * m[12] * m[7] - m[3] * m[4] * m[14] + m[3] * m[12] * m[6];
    r[7] = m[0] * m[6] * m[11] - m[0] * m[10] * m[7] - m[2] * m[4] * m[11] + m[2] * m[8] * m[7] + m[3] * m[4] * m[10] - m[3] * m[8] * m[6];

    r[8] = m[4] * m[9] * m[15] - m[4] * m[13] * m[11] - m[5] * m[8] * m[15] + m[5] * m[12] * m[11] + m[7] * m[8] * m[13] - m[7] * m[12] * m[9];
    r[9] = -m[0] * m[9] * m[15] + m[0] * m[13] * m[11] + m[1] * m[8] * m[15] - m[1] * m[12] * m[11] - m[3] * m[8] * m[13] + m[3] * m[12] * m[9];
    r[10] = m[0] * m[5] * m[15] - m[0] * m[13] * m[7] - m[1] * m[4] * m[15] + m[1] * m[12] * m[7] + m[3] * m[4] * m[13] - m[3] * m[12] * m[5];
    r[11] = -m[0] * m[5] * m[11] + m[0] * m[9] * m[7] + m[1] * m[4] * m[11] - m[1] * m[8] * m[7] - m[3] * m[4] * m[9] + m[3] * m[8] * m[5];

    r[12] = -m[4] * m[9] * m[14] + m[4] * m[13] * m[10] + m[5] * m[8] * m[14] - m[5] * m[12] * m[10] - m[6] * m[8] * m[13] + m[6] * m[12] * m[9];
    r[13] = m[0] * m[9] * m[14] - m[0] * m[13] * m[10] - m[1] * m[8] * m[14] + m[1] * m[12] * m[10] + m[2] * m[8] * m[13] - m[2] * m[12] * m[9];
    r[14] = -m[0] * m[5] * m[14] + m[0] * m[13] * m[6] + m[1] * m[4] * m[14] - m[1] * m[12] * m[6] - m[2] * m[4] * m[13] + m[2] * m[12] * m[5];
    r[15] = m[0] * m[5] * m[10] - m[0] * m[9] * m[6] - m[1] * m[4] * m[10] + m[1] * m[8] * m[6] + m[2] * m[4] * m[9] - m[2] * m[8] * m[5];

    let det = m[0] * r[0] + m[1] * r[4] + m[2] * r[8] + m[3] * r[12];
    for (let i = 0; i < 16; i++) r[i] /= det;

    return result;
  }

  /**
   * Transposes the top left 3x3 of the matrix.
   * 
   * @returns A new matrix that is the transpose of the top left 3x3 of the current matrix.
   */
  public transpose3x3(): Matrix {
    if (this.rows !== 4 || this.columns !== 4) {
      throw new Error("Not implemented for this matrix type");
    }

    let result = new Matrix(3, 3);

    result.data[0] = this.data[0];
    result.data[1] = this.data[4];
    result.data[2] = this.data[8];
    result.data[3] = this.data[1];
    result.data[4] = this.data[5];
    result.data[5] = this.data[9];
    result.data[6] = this.data[2];
    result.data[7] = this.data[6];
    result.data[8] = this.data[10];

    return result;
  }

  /**
   * Gets the value at the given indices in the matrix.
   * 
   * @param row The row index.
   * @param column The column index.
   * @returns The value.
   */
  public get(row: number, column: number): number {
    return this.data[row * this.columns + column];
  }

  /**
   * Uploads the matrix to the shader program.
   * 
   * @param program The shader program.
   * @param target The variable name in the shader.
   */
  public uploadToShader(program: ShaderProgram, target: string) {
    let location = program.getUniformLocation(target);

    if (this.rows === 4 && this.columns === 4) {
      TSGL.gl.uniformMatrix4fv(location, true, this.data);
    } else if (this.rows === 3 && this.columns === 3) {
      TSGL.gl.uniformMatrix3fv(location, true, this.data);
    } else {
      throw new Error("Not implemented for this matrix type");
    }
  }

  /**
   * Creates a new identity matrix.
   * 
   * @returns The identity matrix.
   */
  public static identity(): Matrix {
    return new Matrix(4, 4);
  }

  /**
   * Calculates a 4x4 transformation matrix to translate by the given vector.
   * 
   * @param vector The vector to translate by.
   * @returns The transformation matrix.
   */
  public static translate(vector: Vector): Matrix {
    let result = new Matrix(4, 4);
    result.data[3] = vector.x;
    result.data[7] = vector.y;
    result.data[11] = vector.z;
    return result;
  }

  /**
   * Calculates a 4x4 transformation matrix to scale by the given vector.
   * 
   * @param vector The vector to scale by.
   * @returns The transformation matrix.
   */
  public static scale(vector: Vector): Matrix {
    let result = new Matrix(4, 4);
    result.data[0] = vector.x;
    result.data[5] = vector.y;
    result.data[10] = vector.z;
    return result;
  }

  /**
   * Calculates a 4x4 transformation matrix to rotate around the X axis by the given angle.
   * 
   * @param angle The angle to rotate by, in radians.
   * @returns The transformation matrix.
   */
  public static rotateX(angle: number): Matrix {
    let result = new Matrix(4, 4);
    result.data[5] = Math.cos(angle);
    result.data[6] = Math.sin(angle);
    result.data[9] = -Math.sin(angle);
    result.data[10] = Math.cos(angle);
    return result;
  }

  /**
   * Calculates a 4x4 transformation matrix to rotate around the Y axis by the given angle.
   * 
   * @param angle The angle to rotate by, in radians.
   * @returns The transformation matrix.
   */
  public static rotateY(angle: number): Matrix {
    let result = new Matrix(4, 4);
    result.data[0] = Math.cos(angle);
    result.data[2] = -Math.sin(angle);
    result.data[8] = Math.sin(angle);
    result.data[10] = Math.cos(angle);
    return result;
  }

  /**
   * Calculates a 4x4 transformation matrix to rotate around the Z axis by the given angle.
   * 
   * @param angle The angle to rotate by, in radians.
   * @returns The transformation matrix.
   */
  public static rotateZ(angle: number): Matrix {
    let result = new Matrix(4, 4);
    result.data[0] = Math.cos(angle);
    result.data[1] = Math.sin(angle);
    result.data[4] = -Math.sin(angle);
    result.data[5] = Math.cos(angle);
    return result;
  }
}

/**
 * A 3D vector.
 */
export class Vector {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  /**
   * Creates a new vector from its components.
   * 
   * @param x The x component.
   * @param y The y component.
   * @param z The z component.
   */
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Adds a vector.
   * 
   * @param rhs The vector to add.
   * @returns The result of the addition.
   */
  public add(rhs: Vector): Vector {
    return new Vector(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z);
  }

  /**
   * Subtracts a vector.
   * 
   * @param rhs The vector to subtract.
   * @returns The result of the subtraction.
   */
  public sub(rhs: Vector): Vector {
    return new Vector(this.x - rhs.x, this.y - rhs.y, this.z - rhs.z);
  }

  /**
   * Calculates the dot (scalar) product of two vectors.
   * 
   * @param rhs The other vector.
   * @returns The dot product.
   */
  public dot(rhs: Vector): number {
    return this.x * rhs.x + this.y * rhs.y + this.z * rhs.z;
  }

  /**
   * Calculates the cross (vector) product of two vectors.
   * 
   * @param rhs The other vector.
   * @returns The cross product.
   */
  public cross(rhs: Vector): Vector {
    return new Vector(
      this.y * rhs.z - this.z * rhs.y,
      this.z * rhs.x - this.x * rhs.z,
      this.x * rhs.y - this.y * rhs.x
    );
  }

  /**
   * Calculates the magnitude of the vector.
   * 
   * @returns The magnitude of the vector.
   */
  public magnitude(): number {
    return Math.sqrt(this.dot(this));
  }

  /**
   * Normalises the vector.
   * 
   * @returns The normalised vector.
   */
  public normalize(): Vector {
    let mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag, this.z / mag);
  }

  /**
   * Scales the vector by a scalar.
   * 
   * @param scalar The scalar to multiply each component by.
   * @returns The scaled vector.
   */
  public scale(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Uploads the vector to the shader program.
   * 
   * @param program The shader program.
   * @param target The name of the variable.
   */
  public uploadToShader(program: ShaderProgram, target: string) {
    let location = program.getUniformLocation(target);
    TSGL.gl.uniform3f(location, this.x, this.y, this.z);
  }

  /**
   * Converts the vector to a string representation.
   * 
   * @returns The string representation of the vector.
   */
  public toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}