#version 300 es

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

uniform float fog_density;
uniform vec3 fog_color;

uniform int light_count;
uniform vec3[4] light_colors;
uniform int[4] light_types;
uniform vec3[4] light_vectors;

vec4 tonemap(vec3 linear) {
  float brightness = 1.2;
  float gamma = 2.2;

  return vec4(pow(linear * brightness, vec3(1.0 / gamma)), 1);
}

void main() {
  vec3 ambient_color = vec3(0.01, 0.01, 0.01);
  vec3 tex_color = texture(tex, frag_texcoord).rgb;
  
  vec3 linear = ka * ambient_color + ke;

  vec3 v = wc_camera_position - wc_frag_pos;
  float d = length(v);
  v = normalize(v);

  for (int i = 0; i < light_count; i++) {
    vec3 light_color = light_colors[i];
    vec3 light_vector = light_vectors[i];

    vec3 l; // vector to light
    float intensity;

    if (light_types[i] == 0) {
      // point light

      vec3 l_unnormalized = light_vector - wc_frag_pos;
      float len = length(l_unnormalized);
      intensity = 1.0 / (1.0 + len * len);
      l = normalize(l_unnormalized);
    } else if (light_types[i] == 1) {
      // directional light

      intensity = 1.0;
      l = normalize(-light_vector);
    }

    vec3 diffuse = kd * light_color * intensity * tex_color * max(dot(wc_frag_normal, l), 0.0);
    vec3 specular = ks * light_color * intensity * pow(max(dot(reflect(-l, wc_frag_normal), v), 0.0), ns);

    linear += diffuse + specular;
  }

  color = tonemap(linear);

  if (fog_density != 0.0) {
    float fog_factor = exp2(-fog_density * d);
    color = mix(vec4(fog_color, 1.0), color, fog_factor);
  }
}