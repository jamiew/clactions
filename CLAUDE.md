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

# Or from TUI
/fix-workflows [run-id]
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

### 10 Claude Workflows

1. `fetch-nytimes.yml` (30m) - Scrapes NYT, updates data.json
2. `fetch-glif.yml` (2h) - Gets Glif featured content
3. `run-glif.yml` (15m) - Runs Glif, processes output
4. `auto-improve.yml` (6h) - Makes code improvements via PR
5. `improve-ui.yml` (12h) - Redesigns UI via PR
6. `claude-pr-review.yml` (on PR) - Reviews all PRs
7. `meta-manager.yml` (weekly) - Optimizes workflow configs
8. `self-repair.yml` (on failure / 30m) - Auto-fixes failures ⭐
9. `todo-worker.yml` (8h) - Reads TODO.md, implements tasks ⭐
10. `claude-issue-bot.yml` (@claude) - Implements issues via PR ⭐

### 3 Support Workflows

- `auto-merge.yml` - Merges approved Claude PRs
- `deploy-pages.yml` - Deploys to GitHub Pages (requires Pages enabled!)
- `scheduled-deploy.yml` - Regenerates site hourly

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
2. Handler gathers logs (`scripts/fix-workflows.sh`)
3. Claude analyzes root cause
4. Implements fix (commit or PR)
5. Done

Or trigger manually: `/fix-workflows` in TUI or `gh workflow run self-repair.yml`

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
