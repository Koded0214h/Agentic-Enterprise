import { Command } from '../../types/command.js';
import { spawn, spawnSync } from 'child_process';
import { join } from 'path';
import { getProjectRoot } from '../../bootstrap/state.js';
import { getSwarmPackageRoot } from '../../utils/swarmPackageRoot.js';

function resolvePython(): string {
  const fromEnv = process.env.SWARM_PYTHON;
  if (fromEnv) {
    return fromEnv;
  }
  for (const cmd of ['python3', 'python']) {
    const r = spawnSync(cmd, ['-V'], { encoding: 'utf8' });
    if (r.status === 0) {
      return cmd;
    }
  }
  return 'python3';
}

const swarm: Command = {
  name: 'swarm',
  description: 'Run the multi-agent orchestrator for a complex goal',
  usage: '[goal]',
  isEnabled: () => true,
  isHidden: () => false,
  run: async ({ args, stdout }) => {
    const goal = args.join(' ');
    if (!goal) {
      stdout.write('Please provide a goal for the swarm.\n');
      return;
    }

    const packageRoot = getSwarmPackageRoot(import.meta.url);
    const orchestratorPath = join(packageRoot, 'orchestrator.py');

    stdout.write(`🚀 Launching Swarm for goal: ${goal}\n`);

    return new Promise((resolve) => {
      const child = spawn(resolvePython(), [orchestratorPath, goal, '--project', getProjectRoot()], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { ...process.env, SWARM_ROOT: packageRoot },
      });

      child.on('exit', () => {
        resolve();
      });
    });
  },
};

export default swarm;
