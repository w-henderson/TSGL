class Random {
  private seed: number;
  private modulus: number = Math.pow(2, 31);
  private multiplier: number = 1103515245;
  private increment: number = 12345;

  private precision: number = 1000;

  constructor(seed?: number) {
    this.seed = seed || new Date().getTime();
  }

  public next(seed: number = this.seed): number {
    this.seed = (this.multiplier * this.seed + this.increment) % this.modulus;
    return this.seed;
  }

  public random(): number {
    return (this.next() % this.precision) / this.precision;
  }

  public rangeContinuous(start: number, end: number): number {
    return start + this.random() * (end - start);
  }

  public rangeDiscrete(start: number, end: number): number {
    return (this.next() % (end - start)) + start;
  }
}

export default Random;