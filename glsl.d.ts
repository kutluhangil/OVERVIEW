// Type declaration for GLSL shader files.
// Webpack's asset/source loader (configured in next.config.js) returns
// the raw file content as a string, so we declare these modules accordingly.

declare module '*.glsl' {
  const source: string;
  export default source;
}

declare module '*.vert' {
  const source: string;
  export default source;
}

declare module '*.frag' {
  const source: string;
  export default source;
}

declare module '*.vert.glsl' {
  const source: string;
  export default source;
}

declare module '*.frag.glsl' {
  const source: string;
  export default source;
}
