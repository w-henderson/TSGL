export function createShader(ctx: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  let shader = ctx.createShader(type);
  if (shader === null) return null;
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);

  let success = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
  if (success) return shader;

  console.error(ctx.getShaderInfoLog(shader));
  ctx.deleteShader(shader);

  return null;
}