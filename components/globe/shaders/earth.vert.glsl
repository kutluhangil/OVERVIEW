// Earth surface vertex shader
// Outputs varyings used by the fragment shader for lighting and texture sampling.

uniform vec3 uSunDirection; // Unit vector pointing toward the sun (world space)

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;   // World-space position
varying vec3 vSunDir;     // Passed through to fragment shader

void main() {
  vUv = uv;

  // Normal in world space (no non-uniform scale on our unit sphere)
  vNormal = normalize(normalMatrix * normal);

  // World position for environment mapping / specular
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vPosition = worldPos.xyz;

  // Pass sun direction through (avoids re-uploading as fragment uniform)
  vSunDir = uSunDirection;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
