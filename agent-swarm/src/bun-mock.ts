export function feature(name: string): boolean {
  // Always return false for features in Agent Swarm, as we are running in Node, not Bun-bundled mode.
  return false;
}

export const MACRO = {
  VERSION: '4.0.2',
  PACKAGE_URL: '@anas.abubakar/swarm',
};

// Global polyfill for Node runtime
if (typeof global !== 'undefined') {
  (global as any).MACRO = MACRO;
}
