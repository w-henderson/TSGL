export default `#version 300 es

precision highp float;

in vec3 wc_frag_normal;
in vec2 frag_texcoord;
in vec3 wc_frag_pos;

out vec4 color;

uniform sampler2D tex;
uniform vec3 wc_camera_position;

uniform float ns;
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform vec3 ke;
uniform float ni;
uniform float d;
uniform float illum;

uniform int light_count;
uniform vec3[4] light_colors;
uniform vec3[4] wc_light_positions;

vec4 tonemap(vec3 linear) {
  float brightness = 1.2;
  float gamma = 2.2;

  return vec4(pow(linear * brightness, vec3(1.0 / gamma)), 1);
}

void main() {
  vec3 ambient_color = vec3(0.01, 0.01, 0.01);
  vec3 tex_color = texture(tex, frag_texcoord).rgb;
  
  vec3 linear = ka * ambient_color + ke;

  vec3 v = normalize(wc_camera_position - wc_frag_pos);

  for (int i = 0; i < light_count; i++) {
    vec3 light_color = light_colors[i];
    vec3 wc_light_pos = wc_light_positions[i];

    vec3 l = normalize(wc_light_pos - wc_frag_pos);
    vec3 diffuse = kd * light_color * tex_color * max(dot(wc_frag_normal, l), 0.0);
    vec3 specular = ks * light_color * pow(max(dot(reflect(-l, wc_frag_normal), v), 0.0), ns);

    linear += diffuse + specular;
  }

  color = tonemap(linear);
}`