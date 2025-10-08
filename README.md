# Claude GitHub Actions Automaton

Self-improving automation where Claude reads the world, updates code/website, reviews itself, fixes itself. All via GitHub Actions.

## What It Does

GitHub Actions use Claude to:
- Scrape external sources (NY Times, Glif API)
- Update data.json → auto-deploy website
- Make code improvements via PRs
- Review its own PRs
- Fix broken workflows automatically
- Manage its own cron schedules

**10 of 13 workflows use Claude for decisions.** The rest are simple deploys.

## Workflows

| Workflow | Schedule | What | Updates |
|----------|----------|------|---------|
| `fetch-nytimes.yml` | 30min | Scrapes NYT headlines | data.json |
| `fetch-glif.yml` | 2hr | Gets featured Glif workflows/agents | data.json |
| `run-glif.yml` | 15min | Runs Glif, Claude processes output | data.json + code |
| `auto-improve.yml` | 6hr | Claude analyzes repo, makes improvements | Code (PR) |
| `improve-ui.yml` | 12hr | Claude redesigns website UI | Code (PR) |
| `meta-manager.yml` | Weekly | Claude optimizes workflow configs | Workflows (PR) |
| `claude-pr-review.yml` | On PR | Claude reviews all PRs | Review/approval |
| `self-repair.yml` ⭐ | On failure | Claude auto-fixes broken workflows | Fix (commit/PR) |
| `todo-worker.yml` ⭐ | 8hr | Reads TODO.md, implements tasks | Feature (PR) |
| `claude-issue-bot.yml` ⭐ | On @claude | Implements issues via PR | Feature (PR) |
| `auto-merge.yml` | On approval | Merges approved Claude PRs | - |
| `deploy-pages.yml` | On push | Deploys to GitHub Pages | - |
| `scheduled-deploy.yml` | Hourly | Regenerates website | - |

## Self-Repair ⭐

The killer feature: **workflows fix themselves.**

`self-repair.yml` auto-triggers when any workflow fails. Claude:
1. Grabs failure logs
2. Identifies root cause
3. Implements fix (commit or PR)
4. Also runs every 30min to catch stragglers

Trigger manually:
```bash
gh workflow run self-repair.yml
```

Or from Claude Code TUI:
```
/fix-workflows
```

## Workflow Commands

Manage workflows with `gh`:

```bash
# List all workflows
gh workflow list

# Run a workflow
gh workflow run fetch-nytimes.yml
gh workflow run todo-worker.yml -f mode=plan

# Watch runs in real-time
gh run watch

# List recent runs
gh run list --limit 20

# View specific run
gh run view <run-id>
gh run view <run-id> --log
gh run view <run-id> --log-failed

# Re-run failed workflow
gh run rerun <run-id>
```

Example: Manually trigger NY Times fetch:
```bash
gh workflow run fetch-nytimes.yml && gh run watch
```

## Debug Tools

Quick diagnosis:
```bash
./scripts/analyze-workflow-runs.sh
```

Interactive doctor:
```bash
./scripts/claude-workflow-doctor.sh
```

## Setup

### 1. Enable GitHub Actions
Settings → Actions → General → **Allow all actions**

### 2. Add Secrets
Settings → Secrets and variables → Actions → New repository secret

**Required:**
- `CLAUDE_CODE_OAUTH_TOKEN` - From Claude Code GitHub App install

**Optional:**
- `GLIF_API_TOKEN` - From https://glif.app (for Glif integration)
- `GLIF_WORKFLOW_ID` - Specific Glif workflow to run

### 3. Configure Permissions
Settings → Actions → General → Workflow permissions:
- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**

### 4. Enable GitHub Pages
Settings → Pages → Source: **GitHub Actions**

Your site will be at: `https://[username].github.io/[repo-name]`

### 5. YOLO Mode (Optional but Recommended)
For maximum autonomy, enable auto-merge:

**Settings → General:**
- ✅ **Allow auto-merge** (lets Claude merge its own PRs)
- ✅ **Automatically delete head branches** (cleanup after merge)

This lets the system truly run itself. Claude creates PRs → reviews them → auto-merges → deletes branches. Full autonomy.

### 6. @claude Mentions in Issues
Create an issue and mention `@claude` - it will:
1. Read the issue
2. Implement the solution
3. Create a PR automatically
4. Comment back with the PR link

Wild mode activated. 🎢

## The Loop

```
External data → Claude fetches → Updates data.json → Deploys site
                                         ↓
                        Claude improves UI → Creates PR
                                         ↓
                            Claude reviews PR → Auto-merge
                                         ↓
                                  [Better site]
```

Meanwhile:
- `meta-manager.yml` optimizes the workflows
- `self-repair.yml` fixes failures
- `auto-improve.yml` adds features
- `todo-worker.yml` implements ideas from TODO.md

It's **autonomous infrastructure** that gets better over time.

## Files

- `data.json` - Central data store (NY Times, Glif content)
- `TODO.md` - Ideas and tasks for Claude to implement
- `.github/workflows/` - All automation
- `scripts/` - Debugging and repair tools
- `.claude/commands/` - Custom slash commands
- `.claude/subagents/` - Subagent documentation

## Glif Integration

Two ways:
1. Fetch top workflows/agents via API → display on site
2. Run Glif workflow → Claude processes output → updates site

Creates a **Glif → Claude → GitHub Pages** generative pipeline.

## Common Issues

**Pages not enabled**: Settings → Pages → Source: GitHub Actions

**Missing secrets**: Settings → Secrets → `ANTHROPIC_API_KEY`

**Permission denied**: Settings → Actions → Workflow permissions → Read/write

**data.json missing**: Create it: `{"message": "Initial data"}`

Let `self-repair.yml` fix most issues automatically.

## TODO-Driven Development

Add ideas to `TODO.md`. The `todo-worker.yml` workflow reads it every 8 hours, picks feasible tasks, and implements them via PRs.

Trigger manually:
```bash
# Let Claude pick best item
gh workflow run todo-worker.yml

# Work on specific item
gh workflow run todo-worker.yml -f force_item="Add Reddit scraper"

# Just plan, don't implement
gh workflow run todo-worker.yml -f mode=plan
```

Modes:
- **implement** (default) - Actually builds the feature
- **plan** - Creates implementation plan without coding
- **survey** - Organizes and prioritizes all TODOs

## Philosophy

Autonomous AI managing infrastructure. Claude reads, decides, acts, reviews, fixes. Add ideas to TODO.md and Claude builds them. Self-improving system.
