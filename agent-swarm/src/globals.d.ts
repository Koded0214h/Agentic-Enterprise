declare const MACRO: {
  VERSION: string;
  PACKAGE_URL: string;
};

declare module 'bun:bundle' {
  export function feature(name: string): boolean;
}
