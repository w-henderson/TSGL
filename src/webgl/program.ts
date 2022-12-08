export function createProgram(ctx: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  let program = ctx.createProgram();
  if (program === null) return null;

  ctx.attachShader(program, vertexShader);
  ctx.attachShader(program, fragmentShader);
  ctx.linkProgram(program);

  let success = ctx.getProgramParameter(program, ctx.LINK_STATUS);
  if (success) return program;

  console.error(ctx.getProgramInfoLog(program));
  ctx.deleteProgram(program);

  return null;
}