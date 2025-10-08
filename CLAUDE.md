# CLAUDE.md

Guide for Claude Code working in this repo.

## What This Is

Self-improving GitHub Actions system. Claude reads external data, updates code/website, reviews itself, fixes itself. All automated.

## Quick Commands

### Debug Failed Workflows
```bash
# Quick check
./scripts/analyze-workflow-runs.sh

# Full diagnosis
./scripts/claude-workflow-doctor.sh

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

### 8 Claude Workflows

1. `fetch-nytimes.yml` (30m) - Scrapes NYT, updates data.json
2. `fetch-glif.yml` (2h) - Gets Glif featured content
3. `run-glif.yml` (15m) - Runs Glif, processes output
4. `auto-improve.yml` (6h) - Makes code improvements via PR
5. `improve-ui.yml` (12h) - Redesigns UI via PR
6. `claude-pr-review.yml` (on PR) - Reviews all PRs
7. `meta-manager.yml` (weekly) - Optimizes workflow configs
8. `self-repair.yml` (on failure / 30m) - Auto-fixes failures ⭐

### 3 Support Workflows

- `auto-merge.yml` - Merges approved Claude PRs
- `deploy-pages.yml` - Deploys to GitHub Pages
- `scheduled-deploy.yml` - Regenerates site hourly

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
- `.github/workflows/` - All workflows
- `scripts/` - Debug and repair tools
- `.claude/commands/` - Custom slash commands (Markdown)
- `.claude/subagents/` - Subagent docs

## Self-Repair System

When workflows fail:

1. `self-repair.yml` auto-triggers
2. Handler gathers logs (`scripts/fix-workflows-handler.sh`)
3. Claude analyzes root cause
4. Implements fix (commit or PR)
5. Done

Or trigger manually: `/fix-workflows` in TUI or `gh workflow run self-repair.yml`

## Debugging Workflow Failures

Run `./scripts/claude-workflow-doctor.sh` first. It checks:
- GitHub Pages enabled?
- Secrets present? (ANTHROPIC_API_KEY, GLIF_API_TOKEN)
- Permissions set? (read/write)
- data.json exists?

Let `self-repair.yml` auto-fix most issues.

## Common Issues

**Pages**: Settings → Pages → Source: GitHub Actions

**Secrets**: Settings → Secrets → Actions
- Required: `ANTHROPIC_API_KEY`
- Optional: `GLIF_API_TOKEN`, `GLIF_WORKFLOW_ID`

**Permissions**: Settings → Actions → Workflow permissions → Read/write

**data.json**: Create with `{"message": "Initial data"}`

## Development

When making changes:
- Claude workflows use `anthropics/claude-code-action@v1`
- Data updates commit directly to main (no PR)
- Code changes create PRs
- `claude-pr-review.yml` reviews everything
- `auto-merge.yml` merges when approved

The system self-heals and self-improves. Your changes will be reviewed by Claude.
