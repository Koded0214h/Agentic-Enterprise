import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Directory where orchestrator.py, agents/, engines/, and swarm.config.json live
 * (npm package root). Not the user's git project — use getProjectRoot() for that.
 */
export function getSwarmPackageRoot(fromModuleUrl: string): string {
  const fromEnv = process.env.SWARM_ROOT;
  if (fromEnv && existsSync(join(fromEnv, 'orchestrator.py'))) {
    return fromEnv;
  }
  const here = dirname(fileURLToPath(fromModuleUrl));
  return join(here, '..', '..', '..');
}
