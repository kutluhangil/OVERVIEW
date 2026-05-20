// Atmosphere shell vertex shader
// The geometry is a slightly enlarged sphere rendered from the inside (BackSide).
// We compute a "rim weight" for Fresnel glow in the fragment shader.

varying vec3 vNormal;
varying vec3 vPosition;
varying float vRimWeight;

void main() {
  // Pass normal in world space
  vNormal   = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;

  // Camera-space position for rim calculation
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  // View direction in camera space (from vertex toward camera)
  vec3 viewDir = normalize(-mvPos.xyz);

  // Normal in camera/eye space
  vec3 eyeNormal = normalize(normalMatrix * normal);

  // Fresnel rim: maximum when normal is perpendicular to view ray
  vRimWeight = 1.0 - abs(dot(eyeNormal, viewDir));

  gl_Position = projectionMatrix * mvPos;
}
