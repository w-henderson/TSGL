const fs = require("fs");
const path = require("path");

const shaders = fs.readdirSync(path.join(__dirname, "../src/shaders"));

for (let shader of shaders) {
  if (shader.endsWith(".glsl")) {
    const shaderPath = path.join(__dirname, "../src/shaders", shader);
    const shaderSource = fs.readFileSync(shaderPath, "utf8");
    const builtShader = `export default \`${shaderSource}\``;
    const builtShaderPath = path.join(__dirname, "../src/shaders", shader.replace(".glsl", ".ts"));
    fs.writeFileSync(builtShaderPath, builtShader);
  }
}