import TSGL from "./lib";

import ShaderProgram from "./webgl/program";

export class Matrix {
  private data: Float32Array;
  private rows: number;
  private columns: number;

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

  public static squareFromArray(data: number[]): Matrix {
    let size = Math.sqrt(data.length);
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

  public invert(): Matrix {
    if (this.rows !== 4 || this.columns !== 4) {
      throw new Error("Not implemented for this matrix type");
    }

    let array = [
      [this.data[0], this.data[1], this.data[2], this.data[3]],
      [this.data[4], this.data[5], this.data[6], this.data[7]],
      [this.data[8], this.data[9], this.data[10], this.data[11]],
      [this.data[12], this.data[13], this.data[14], this.data[15]]
    ];

    let result = (window as any).math.inv(array);

    return Matrix.squareFromArray(result.flat());
  }

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

  public get(row: number, column: number): number {
    return this.data[row * this.columns + column];
  }

  public uploadToShader(program: ShaderProgram, target: string) {
    let location = TSGL.gl.getUniformLocation(program.getHandle()!, target)!;

    if (this.rows === 4 && this.columns === 4) {
      TSGL.gl.uniformMatrix4fv(location, true, this.data);
    } else if (this.rows === 3 && this.columns === 3) {
      TSGL.gl.uniformMatrix3fv(location, true, this.data);
    } else {
      throw new Error("Not implemented for this matrix type");
    }
  }

  public static identity(): Matrix {
    return new Matrix(4, 4);
  }

  public static translate(vector: Vector): Matrix {
    let result = new Matrix(4, 4);
    result.data[3] = vector.x;
    result.data[7] = vector.y;
    result.data[11] = vector.z;
    return result;
  }

  public static scale(vector: Vector): Matrix {
    let result = new Matrix(4, 4);
    result.data[0] = vector.x;
    result.data[5] = vector.y;
    result.data[10] = vector.z;
    return result;
  }

  public static rotateX(angle: number): Matrix {
    let result = new Matrix(4, 4);
    result.data[5] = Math.cos(angle);
    result.data[6] = Math.sin(angle);
    result.data[9] = -Math.sin(angle);
    result.data[10] = Math.cos(angle);
    return result;
  }

  public static rotateY(angle: number): Matrix {
    let result = new Matrix(4, 4);
    result.data[0] = Math.cos(angle);
    result.data[2] = -Math.sin(angle);
    result.data[8] = Math.sin(angle);
    result.data[10] = Math.cos(angle);
    return result;
  }

  public static rotateZ(angle: number): Matrix {
    let result = new Matrix(4, 4);
    result.data[0] = Math.cos(angle);
    result.data[1] = Math.sin(angle);
    result.data[4] = -Math.sin(angle);
    result.data[5] = Math.cos(angle);
    return result;
  }
}

export class Vector {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public add(rhs: Vector): Vector {
    return new Vector(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z);
  }

  public sub(rhs: Vector): Vector {
    return new Vector(this.x - rhs.x, this.y - rhs.y, this.z - rhs.z);
  }

  public dot(rhs: Vector): number {
    return this.x * rhs.x + this.y * rhs.y + this.z * rhs.z;
  }

  public cross(rhs: Vector): Vector {
    return new Vector(
      this.y * rhs.z - this.z * rhs.y,
      this.z * rhs.x - this.x * rhs.z,
      this.x * rhs.y - this.y * rhs.x
    );
  }

  public magnitude(): number {
    return Math.sqrt(this.dot(this));
  }

  public normalize(): Vector {
    let mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag, this.z / mag);
  }

  public scale(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public uploadToShader(program: ShaderProgram, target: string) {
    let location = TSGL.gl.getUniformLocation(program.getHandle()!, target)!;
    TSGL.gl.uniform3f(location, this.x, this.y, this.z);
  }

  public toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}