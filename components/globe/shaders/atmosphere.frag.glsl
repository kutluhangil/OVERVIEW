// Atmosphere shell fragment shader
// Fresnel-based scattering glow rendered with additive blending.
// Inner (toward globe) = blue #4a9eff, outer (limb) = teal #2dd4bf

uniform vec3 uSunDirection; // Unit vector toward sun

varying vec3 vNormal;
varying vec3 vPosition;
varying float vRimWeight;

void main() {
  // -- Fresnel power curve --
  // vRimWeight is ~0 at pole (facing camera), ~1 at limb
  float rim = pow(clamp(vRimWeight, 0.0, 1.0), 2.2);

  // -- Sun-facing boost --
  vec3 N   = normalize(vNormal);
  vec3 sun = normalize(uSunDirection);
  float sunFacing = max(dot(N, sun), 0.0) * 0.5 + 0.5; // remap to 0.5..1.0

  // -- Color gradient: inner blue → outer teal --
  vec3 innerColor = vec3(0.290, 0.604, 1.000); // #4a9eff
  vec3 outerColor = vec3(0.176, 0.831, 0.749); // #2dd4bf
  vec3 atmColor   = mix(innerColor, outerColor, rim);

  // -- Final alpha: strong at limb, zero at poles --
  // Sun-facing hemisphere is brighter (more scattering)
  float alpha = rim * sunFacing * 0.72;

  // Soft roll-off so the inner edge of the shell fades gracefully
  alpha *= smoothstep(0.0, 0.35, rim);

  gl_FragColor = vec4(atmColor * alpha, alpha);
}
