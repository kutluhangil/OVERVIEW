// Earth surface fragment shader
// Blends day/night textures based on sun dot product.
// City lights bloom on the dark side, specular on oceans, Fresnel rim glow.

uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform sampler2D specularMap;   // R channel: specularity (1 = water)
uniform sampler2D normalMap;     // Tangent-space normal map

uniform vec3 uCameraPosition;   // World-space camera position for specular
uniform float uTime;            // Seconds, for subtle animation

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vSunDir;

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

// Reconstruct a perturbed normal from the normal map sample.
vec3 perturbNormal(vec3 baseNormal, vec2 uv) {
  vec3 sample = texture2D(normalMap, uv).xyz * 2.0 - 1.0;

  // Build tangent frame from normal (works for a sphere)
  vec3 up = abs(baseNormal.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent   = normalize(cross(up, baseNormal));
  vec3 bitangent = cross(baseNormal, tangent);

  return normalize(tangent * sample.x + bitangent * sample.y + baseNormal * (sample.z * 2.0));
}

void main() {
  // ---------------------------------------------------------
  // Sample textures
  // ---------------------------------------------------------
  vec4 dayColor    = texture2D(dayTexture,  vUv);
  vec4 nightColor  = texture2D(nightTexture, vUv);
  float specMask   = texture2D(specularMap, vUv).r; // 1 = water, 0 = land

  // ---------------------------------------------------------
  // Normals
  // ---------------------------------------------------------
  vec3 N = normalize(vNormal);
  vec3 pertN = perturbNormal(N, vUv);

  // ---------------------------------------------------------
  // Sun lighting
  // ---------------------------------------------------------
  vec3 sunDir = normalize(vSunDir);

  // Dot product: 1 = full sun, -1 = deep night
  float NdotL = dot(pertN, sunDir);

  // Soft terminator: transition zone of ~0.15 on each side of the terminator
  // smoothstep maps [-0.15 .. 0.15] → [0 .. 1]
  float dayFactor = smoothstep(-0.15, 0.15, NdotL);

  // ---------------------------------------------------------
  // Day side – diffuse + specular
  // ---------------------------------------------------------
  float diffuse = max(NdotL, 0.0);

  // Specular (Blinn-Phong) — only on ocean pixels
  vec3  viewDir  = normalize(uCameraPosition - vPosition);
  vec3  halfVec  = normalize(sunDir + viewDir);
  float specBase = max(dot(pertN, halfVec), 0.0);
  float specular = pow(specBase, 80.0) * specMask * 2.5;

  // Slightly warm the diffuse to simulate Rayleigh scattering on day side
  vec3 sunColor  = vec3(1.0, 0.97, 0.90);
  vec3 daySurface = dayColor.rgb * (diffuse * 0.85 + 0.15) * sunColor + vec3(specular);

  // ---------------------------------------------------------
  // Night side – city lights
  // ---------------------------------------------------------
  // Boost night texture so city lights glow prominently
  vec3 cityLights = nightColor.rgb * 2.0;

  // Very faint ambient on night side so it's not pure black
  vec3 nightSurface = cityLights + dayColor.rgb * 0.04;

  // ---------------------------------------------------------
  // Blend day / night
  // ---------------------------------------------------------
  vec3 surface = mix(nightSurface, daySurface, dayFactor);

  // ---------------------------------------------------------
  // Fresnel rim glow (atmosphere proxy on the limb)
  // ---------------------------------------------------------
  float fresnel = 1.0 - abs(dot(N, viewDir));
  fresnel = pow(fresnel, 3.5);

  // Tint the rim toward atmospheric blue on the day side, darker on night
  vec3 rimColor = mix(vec3(0.05, 0.12, 0.35), vec3(0.22, 0.55, 1.0), dayFactor);
  surface += rimColor * fresnel * 0.4;

  // ---------------------------------------------------------
  // Output
  // ---------------------------------------------------------
  gl_FragColor = vec4(surface, 1.0);
}
