#version 300 es

precision highp float;

in vec3 wc_frag_normal;
in vec2 frag_texcoord;
in vec3 wc_frag_pos;

out vec4 color;

uniform sampler2D tex;
uniform vec3 wc_camera_position;

vec4 tonemap(vec3 linear) {
  float brightness = 1.2;
  float gamma = 2.2;

  return vec4(pow(linear * brightness, vec3(1.0 / gamma)), 1);
}

void main() {
  vec3 ambient_color = vec3(0.01, 0.01, 0.01);
  vec3 diffuse_color = wc_frag_normal;
  vec3 specular_color = vec3(1, 1, 1);
  float alpha = 32.0;

  vec3 wc_light_pos = vec3(3, 4, 3);
  vec3 light_color = vec3(1, 1, 1);

  vec3 l = normalize(wc_light_pos - wc_frag_pos);
  vec3 v = normalize(wc_camera_position - wc_frag_pos);
  vec3 ambient = ambient_color;
  vec3 diffuse = diffuse_color * light_color * max(dot(wc_frag_normal, l), 0.0);
  vec3 specular = specular_color * light_color * pow(max(dot(reflect(-l, wc_frag_normal), v), 0.0), alpha);

  vec3 linear = ambient + diffuse + specular;

  color = tonemap(linear);
}