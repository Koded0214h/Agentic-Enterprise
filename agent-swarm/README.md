# Agent Swarm

Multi-agent orchestration from the terminal. One install, many agents, pick your models and tools.

**Package:** [`@anas.abubakar/swarm`](https://www.npmjs.com/package/@anas.abubakar/swarm) · **Node.js 18+** required.

**Community:** Discord (living swarm chat) · [GitHub Issues](https://github.com/Anasabubakar/agent-swarm/issues) (tracked bugs).

---

## Install

Global CLI (recommended):

```bash
npm install -g @anas.abubakar/swarm
```

Try without installing globally:

```bash
npx @anas.abubakar/swarm@latest --help
```

---

## Requirements

| What | Why |
| --- | --- |
| **Node.js 18+** | Runs the `swarm` launcher and optional Studio UI (`dist/main.js`). |
| **Python 3** | Default orchestrator (`orchestrator.py`). On first launch, Swarm tries to install Python automatically (Windows: `winget`, macOS: Homebrew when present, Linux: non-interactive `apt`/`dnf` when passwordless sudo works). Override with **`SWARM_PYTHON`** or skip auto-setup with **`SWARM_SKIP_DEPS_BOOTSTRAP=1`**. |
| **npm account / 2FA** | Only maintainers publishing the package—not needed to install or run. |

**Windows note:** teammate “split panes” use **tmux** on Linux/macOS. On native Windows terminals, teammates run **in‑process** (no WSL required). Want real tmux tiling? Use **WSL** or Linux/macOS.

---

## Usage

```bash
# Interactive swarm (Python orchestrator)
swarm

# Pass-through to orchestrator examples
swarm --list-agents
swarm "your objective here"

# Full Ink/React Studio (needs dist/main.js in the package)
SWARM_STUDIO=1 swarm
# or: swarm --studio
```

Disable optional prompts:

```bash
export SWARM_SKIP_UPDATE_CHECK=1      # hide “new version?” prompt
export SWARM_SKIP_DEPS_BOOTSTRAP=1    # skip Python auto-install attempts
```

---

## Updates

- **Manual:**  
  ```bash
  npm install -g @anas.abubakar/swarm@latest
  ```
- **Built-in reminder:** In an **interactive terminal** (`stdout` is a TTY), launching an older install shows a **`[swarm]`** line if npm has a newer version. Answer **`y`** to run **`npm install -g @anas.abubakar/swarm@latest`**, or **`n`** to continue. Prompts are throttled (~36h between nags). Offline or CI? No prompt (`SWARM_SKIP_UPDATE_CHECK=1` to suppress).

---

## From source / dev

```bash
git clone <this-repo>
cd agent-swarm
npm ci
npm run build          # compiles swarm entry + bootstrap + update notifier → dist/
npm install -g .       # link local install for testing
```

---

## Community — living swarm

Ships fly better together. Discord is where people hang out, share setups, shout about releases, and get unstuck quickly. GitHub stays the **source of truth** for bugs that need reproduction and fixes.

### Where to go

| Place | Best for |
| --- | --- |
| **Discord** | Chat, help, showcases, vibes, announcements (you run the server) |
| **[GitHub Issues](https://github.com/Anasabubakar/agent-swarm/issues)** | Crashes, reproducible bugs, concrete feature asks |
| **[GitHub Discussions](https://github.com/Anasabubakar/agent-swarm/discussions)** | Long proposals, FAQs, brainstorming (optional — enable in repo settings if you want it) |

**Discord invite (you add this once):**

1. In Discord: **Create my server** (or use one you already run).
2. **Settings → Invite people → Edit invite link** → expiration **Never** → generate link.
3. Replace the URL below with yours in this README, commit, then cut a tiny npm release so the readme on npm stays in sync too.

👉 **[Join the Swarm Discord](https://discord.gg/REPLACE_ME_WITH_YOUR_INVITE)** ← change `REPLACE_ME_WITH_YOUR_INVITE` only (leave `https://discord.gg/` as-is).

### Channel ideas that keep the swarm alive

- `#announcements` — releases, changelog highlights (muted by default OK).
- `#intro` — who you are, what you ship.
- `#help` — quick questions (`swarm` errors, Python, installs).
- `#bugs` — “open a GitHub Issue + drop the link here” reminder in the pinned post.
- `#showcase` — agents, demos, pipelines.

Pin one short rule: **no API keys**, **be respectful**.

### Contributing

Issues and PRs are welcome. For behavior changes or big ideas, an Issue first helps everyone orient; small doc fixes can go straight as a PR.

---

## Philosophy

Composable agents, parallel work, minimal ceremony: your keys, your machine, registry updates when you choose.

MIT License.
