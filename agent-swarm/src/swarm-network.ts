/**
 * Swarm network / connectivity policy — maps `swarm.config.json` → process env
 * for child processes (orchestrator, studio, engines).
 *
 * Strategy (operator-facing):
 * - Prefer system proxy env (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`); Node and
 *   most CLIs inherit these when we pass `process.env` through.
 * - Optional explicit proxy URLs in config apply only if the corresponding env
 *   var is not already set (config never overrides the shell).
 * - `mode: offline` sets `SWARM_OFFLINE=1` as a hint for tooling; local gateway
 *   calls (127.0.0.1) still work — turn off the gateway or disconnect manually
 *   if you need hard isolation.
 * - `mode: restricted` sets `SWARM_NETWORK_RESTRICTED=1` and tightens default
 *   HTTP timeouts unless overridden by env.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type SwarmNetworkMode = 'normal' | 'restricted' | 'offline';

export type SwarmNetworkJson = {
  strategy?: string;
  mode?: SwarmNetworkMode;
  gateway_connect_timeout_seconds?: number;
  gateway_poll_timeout_seconds?: number;
  proxy?: {
    http?: string | null;
    https?: string | null;
    no_proxy?: string | null;
  };
};

const DEFAULT_GATEWAY_CONNECT_S = 30;
const DEFAULT_GATEWAY_POLL_S = 10;
const RESTRICTED_GATEWAY_CONNECT_S = 15;
const RESTRICTED_GATEWAY_POLL_S = 5;

function parseNetwork(raw: unknown): SwarmNetworkJson {
  if (!raw || typeof raw !== 'object') return {};
  const n = (raw as { network?: unknown }).network;
  if (!n || typeof n !== 'object') return {};
  return n as SwarmNetworkJson;
}

function readConfigPackageRoot(pkgRoot: string): SwarmNetworkJson {
  const path = join(pkgRoot, 'swarm.config.json');
  if (!existsSync(path)) return {};
  try {
    const json = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    return parseNetwork(json);
  } catch {
    return {};
  }
}

/**
 * Env vars for child processes: only fills keys that are absent in `baseEnv`
 * (shell and parent process always win).
 */
export function getSwarmNetworkChildEnv(
  pkgRoot: string,
  baseEnv: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const net = readConfigPackageRoot(pkgRoot);
  const mode: SwarmNetworkMode = net.mode ?? 'normal';
  const out: Record<string, string> = {};

  if (baseEnv.SWARM_NETWORK_MODE === undefined) {
    out.SWARM_NETWORK_MODE = mode;
  }

  if (mode === 'offline' && baseEnv.SWARM_OFFLINE === undefined) {
    out.SWARM_OFFLINE = '1';
  }

  if (mode === 'restricted' && baseEnv.SWARM_NETWORK_RESTRICTED === undefined) {
    out.SWARM_NETWORK_RESTRICTED = '1';
  }

  const restricted = mode === 'restricted';
  const connectDefault = restricted
    ? RESTRICTED_GATEWAY_CONNECT_S
    : DEFAULT_GATEWAY_CONNECT_S;
  const pollDefault = restricted
    ? RESTRICTED_GATEWAY_POLL_S
    : DEFAULT_GATEWAY_POLL_S;

  const connect =
    net.gateway_connect_timeout_seconds ?? connectDefault;
  const poll = net.gateway_poll_timeout_seconds ?? pollDefault;

  if (baseEnv.SWARM_GATEWAY_HTTP_TIMEOUT_SECONDS === undefined) {
    out.SWARM_GATEWAY_HTTP_TIMEOUT_SECONDS = String(
      Math.max(1, Math.min(300, Math.floor(connect))),
    );
  }
  if (baseEnv.SWARM_GATEWAY_POLL_HTTP_TIMEOUT_SECONDS === undefined) {
    out.SWARM_GATEWAY_POLL_HTTP_TIMEOUT_SECONDS = String(
      Math.max(1, Math.min(120, Math.floor(poll))),
    );
  }

  const p = net.proxy;
  if (p) {
    if (p.http && baseEnv.HTTP_PROXY === undefined && baseEnv.http_proxy === undefined) {
      out.HTTP_PROXY = p.http;
    }
    if (p.https && baseEnv.HTTPS_PROXY === undefined && baseEnv.https_proxy === undefined) {
      out.HTTPS_PROXY = p.https;
    }
    if (
      p.no_proxy &&
      baseEnv.NO_PROXY === undefined &&
      baseEnv.no_proxy === undefined
    ) {
      out.NO_PROXY = p.no_proxy;
    }
  }

  return out;
}
