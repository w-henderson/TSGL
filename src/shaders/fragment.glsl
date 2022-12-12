#version 300 es

precision highp float;

in vec3 wc_frag_normal;
in vec2 frag_texcoord;
in vec3 wc_frag_pos;

layout(location = 0) out vec4 color;

uniform sampler2D tex;
uniform vec3 wc_camera_position;

void main() {
  color = vec4(1, 0, 0, 1);
}