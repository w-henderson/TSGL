class Random {
  private seed: bigint;
  private modulus: bigint = 2147483648n;
  private multiplier: bigint = 1103515245n;
  private increment: bigint = 12345n;

  private precision: number = 1000;

  constructor(seed?: bigint | number) {
    this.seed = BigInt(seed || new Date().getTime());
  }

  public next(): number {
    this.seed = (this.multiplier * this.seed + this.increment) % this.modulus;
    return Number(this.seed);
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