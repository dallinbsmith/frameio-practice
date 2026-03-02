/**
 * CSS Module Type Declarations
 *
 * Enables proper TypeScript support for CSS module imports.
 */

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.module.sass' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
