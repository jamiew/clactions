# CLAUDE.md

Guide for Claude Code working in this repo.

## What This Is

Self-improving GitHub Actions system. Claude reads external data, updates code/website, reviews itself, fixes itself. All automated.

## Quick Commands

### Debug Failed Workflows
```bash
# Diagnose failures
./scripts/debug-workflows.sh

# View specific run
gh run view <run-id> --log-failed

# Auto-fix with Claude
gh workflow run self-repair.yml -f run_id=<run-id>
```

### Trigger Workflows
```bash
gh workflow run fetch-nytimes.yml
gh workflow run auto-improve.yml
gh workflow run improve-ui.yml
gh workflow run self-repair.yml

# Check status
gh run list --limit 20
gh run watch
```

## Architecture

### Data Fetchers (6 workflows)

1. `nytimes-headlines.yml` - Fetches NYT RSS feed → data/nytimes.json
2. `glif-top-content.yml` - Gets Glif featured content → data/glif.json
3. `weather-data.yml` - Fetches NYC weather → data/weather.json
4. `crypto-prices.yml` - Fetches crypto prices via CoinGecko → data/crypto-prices.json
5. `rhizome-community.yml` - Scrapes Rhizome.org community → data/rhizome.json
6. `adaptive-theme.yml` - Generates CSS based on time/season/weather → theme-nyc.css

### Autonomous Development (5 workflows)

1. `todo-worker.yml` - Reads TODO.md, implements tasks via PR ⭐
2. `issue-triage.yml` - Analyzes issues, applies labels
3. `claude-code-review.yml` - Reviews all PRs automatically
4. `cross-repo-notify.yml` - Detects workflow changes → creates issues in external repo
5. `auto-merge.yml` - Auto-merges approved Claude PRs

### Self-Improvement (3 workflows)

1. `self-repair.yml` - Auto-fixes workflow failures ⭐
2. `self-improver.yml` - Improves CLAUDE.md & Claude Code setup
3. `update-docs.yml` - Generates workflow documentation → docs/*.md

### Build & Deploy (1 workflow)

- `update-website.yml` - Builds & deploys website to Pages

**Note**: Pages must be manually enabled at Settings → Pages → Source: GitHub Actions

### Data Flow

```
External (NYT, Glif) → Claude → data.json → deploy → site
                                    ↓
                          Claude improves UI → PR
                                    ↓
                            Claude reviews → merge
                                    ↓
                                [Better]
```

## Key Files

- `data.json` - Data store (headlines, Glif content)
- `TODO.md` - Ideas for Claude to implement
- `.github/workflows/` - All workflows
- `scripts/` - Debug and repair tools
- `.claude/commands/` - Custom slash commands (Markdown)
- `.claude/subagents/` - Subagent docs

## Self-Repair System

When workflows fail:

1. `self-repair.yml` auto-triggers
2. Handler gathers logs (`scripts/debug-workflows.sh`)
3. Claude analyzes root cause
4. Implements fix (commit or PR)
5. Done

Or trigger manually: `./scripts/debug-workflows.sh` or `gh workflow run self-repair.yml`

## Debugging Workflow Failures

Run `./scripts/debug-workflows.sh` to diagnose. It shows:
- Failed runs (last 20)
- Success rate by workflow
- Common issue detection (Pages, secrets, permissions, data.json)
- Full logs and next steps

Let `self-repair.yml` auto-fix most issues.

## Common Issues

**Pages**: Settings → Pages → Source: GitHub Actions

**Secrets**: Settings → Secrets → Actions
- Required: `ANTHROPIC_API_KEY`
- Optional: `GLIF_API_TOKEN`, `GLIF_WORKFLOW_ID`

**Permissions**: Settings → Actions → Workflow permissions → Read/write

**data.json**: Create with `{"message": "Initial data"}`

## Development

### Adding New Features

Add ideas to `TODO.md`. The `todo-worker.yml` workflow will:
1. Read the TODO list every 8 hours
2. Pick a feasible task
3. Implement it via PR
4. Mark it complete in TODO.md

Or trigger manually:
```bash
gh workflow run todo-worker.yml
gh workflow run todo-worker.yml -f force_item="Your specific task"
gh workflow run todo-worker.yml -f mode=plan  # Just plan, don't build
```

### Code Patterns

- Claude workflows use `anthropics/claude-code-action@v1`
- Data updates commit directly to main (no PR)
- Code changes create PRs
- `claude-pr-review.yml` reviews everything
- `auto-merge.yml` merges when approved

The system self-heals and self-improves. Your changes will be reviewed by Claude.
