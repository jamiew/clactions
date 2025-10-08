# Claude GitHub Actions Playground

Experimental sandbox for combining Claude Code with GitHub Actions. Claude fetches data, updates websites, creates PRs, reviews code, and attempts to fix its own failures.

## What It Does

This is a playground for exploring what happens when you give Claude access to GitHub Actions:
- Fetch external data (NY Times RSS, Glif API, crypto prices)
- Update data files → auto-deploy static website
- Create code improvements via pull requests
- Review and auto-merge its own PRs
- Attempt to fix broken workflows
- Implement tasks from TODO.md
- Respond to @claude mentions in issues

**13 of 20 workflows** use Claude Code for decision-making and implementation.

## Workflows

### Data Collection & Scraping
Claude fetches external data and updates the website.

| Workflow | Trigger | What | Claude Does |
|----------|---------|------|-------------|
| `fetch-nytimes.yml` | 30min | NYT RSS feed | Parses XML, extracts headlines → `data/nytimes.json` |
| `fetch-glif.yml` | 2hr | Glif featured content | Fetches workflows/agents → `data/glif.json` |
| `run-glif.yml` | 1hr | Run Glif workflow | Processes weather output → `data/weather.json` + updates site |
| `fetch-hackernews.yml` | 6hr | HN top story | Reads story + comments → writes blog post (PR) |
| `fetch-weather.yml` | 1hr | Weather API | Fetches NYC weather → `data/weather.json` |
| `fetch-weather-glif.yml` | 1hr | Weather via Glif | Alternative weather source → `data/weather.json` |
| `fetch-crypto.yml` | 1hr | Crypto prices | Fetches BTC/ETH/DOGE → `data/crypto-prices.json` |

### Self-Improvement & Code Evolution
Claude modifies its own codebase and workflows.

| Workflow | Trigger | What | Claude Does |
|----------|---------|------|-------------|
| `auto-improve.yml` | 6hr | Code improvements | Analyzes repo → suggests enhancements (PR) |
| `improve-ui.yml` | 12hr | UI redesign | Reviews website → creates design improvements (PR) |
| `meta-manager.yml` | Weekly | Workflow optimization | Analyzes workflow configs → optimizes schedules/logic (PR) |

### Self-Healing & Repair
Claude attempts to fix failures automatically.

| Workflow | Trigger | What | Claude Does |
|----------|---------|------|-------------|
| `self-repair.yml` | On failure + 30min | Auto-fix failures | Reads logs → diagnoses issue → implements fix (commit/PR) |

### Issue & PR Automation
Claude responds to developer requests.

| Workflow | Trigger | What | Claude Does |
|----------|---------|------|-------------|
| `claude-issue-bot.yml` | @claude mention | Implement issues | Reads issue → implements solution (PR) + comments back |
| `todo-worker.yml` | 8hr | TODO.md tasks | Reads TODO list → picks task → implements (PR) |
| `claude-pr-review.yml` | On PR open | PR review | Reviews code → leaves comments/approval |
| `auto-merge.yml` | On approval | Auto-merge | Merges approved Claude PRs → deletes branch |

### Build & Deploy
Standard CI/CD (no Claude).

| Workflow | Trigger | What |
|----------|---------|------|
| `build-dashboard.yml` | On data/** push | Rebuilds website from data files → deploys |

### Development Utilities
Testing and development tools.

| Workflow | Trigger | What |
|----------|---------|------|
| `webhook-demo.yml` | repository_dispatch | Webhook testing endpoint |
| `scheduled-deploy.yml` | Hourly | Force rebuild/deploy |
| `manual-deploy.yml` | Manual | Manual deploy trigger |
| `test-claude.yml` | Manual | Test Claude Code integration |

## Self-Repair Experiments

`self-repair.yml` is an experiment in autonomous error recovery. When workflows fail, Claude attempts to:
1. Fetch failure logs via GitHub API
2. Analyze the error and identify root cause
3. Implement a fix (direct commit or PR depending on complexity)
4. Re-run the fixed workflow

It also runs every 30 minutes to catch any failures it might have missed.

**Trigger manually:**
```bash
gh workflow run self-repair.yml
```

**Or from Claude Code CLI:**
```
/fix-workflows [run-id]
```

**Success rate:** Variable. Claude can fix simple issues (missing files, permission errors, API changes) but struggles with complex logic bugs.

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

## Webhook Triggers

The `webhook-demo.yml` workflow can be triggered via external webhooks using GitHub's `repository_dispatch` API.

### Generating a GitHub Token

You need a GitHub Personal Access Token to trigger workflows via webhook.

**Option 1: Fine-Grained Token (Recommended)**

1. Go to https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"**
3. Configure the token:
   - **Token name**: `webhook-trigger` (or whatever you prefer)
   - **Expiration**: Choose duration (90 days, 1 year, custom, or no expiration)
   - **Repository access**: Select **"Only select repositories"** → Choose `jamiew/claude-gha-demo`
   - **Permissions** → Repository permissions:
     - **Administration**: **Read and write** ✅
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't see it again!)

**Option 2: Classic Token**

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Configure the token:
   - **Note**: `webhook-trigger`
   - **Expiration**: Choose duration
   - **Scopes**: Check **`repo`** (Full control of private repositories) ✅
4. Click **"Generate token"**
5. **Copy the token immediately**

**Security Notes:**
- Store the token securely (password manager, environment variable)
- Never commit it to git
- Treat it like a password
- Use fine-grained tokens for better security (limited scope)
- Set expiration dates and rotate tokens regularly

### Using the Webhook

**Endpoint:**
```
POST https://api.github.com/repos/jamiew/claude-gha-demo/dispatches
```

**Headers:**
```
Accept: application/vnd.github+json
Authorization: Bearer YOUR_GITHUB_TOKEN
```

**Payload:**
```json
{
  "event_type": "custom-webhook-event",
  "client_payload": {
    "message": "Your custom message",
    "action": "deploy",
    "data": {
      "key": "value"
    }
  }
}
```

**Trigger with curl:**
```bash
# Replace ghp_xxxxxxxxxxxx with your actual token
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ghp_xxxxxxxxxxxx" \
  https://api.github.com/repos/jamiew/claude-gha-demo/dispatches \
  -d '{"event_type":"custom-webhook-event","client_payload":{"message":"Hello from webhook!"}}'
```

**Trigger with gh CLI (easiest):**
```bash
# gh CLI uses your authenticated session automatically
gh api repos/jamiew/claude-gha-demo/dispatches \
  -f event_type=custom-webhook-event \
  -f client_payload[message]="Hello from webhook" \
  -f client_payload[action]="deploy"
```

**Using environment variable:**
```bash
# Set token once
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Then use it
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/jamiew/claude-gha-demo/dispatches \
  -d '{"event_type":"custom-webhook-event","client_payload":{"message":"Hello!"}}'
```

**Supported event types:**
- `custom-webhook-event` - General webhook demo
- `test-webhook` - Test webhook trigger

**Payload fields** (all optional):
- `message` - Custom message to echo
- `action` - Action type (e.g., "deploy", "notify")
- `data` - Any JSON object with additional data

The workflow will echo all payload data and can be extended to perform actions based on the payload content.

**View the workflow run:**
```bash
gh run list --workflow=webhook-demo.yml --limit 5
gh run watch
```

**Public webhook endpoints:**

To make a publicly accessible webhook (no GitHub token required for callers), use a serverless function to proxy the request:
- [Val Town](https://val.town) - Simple hosted functions
- [Cloudflare Workers](https://workers.cloudflare.com/) - Free edge functions
- Other options: Vercel Functions, AWS Lambda, etc.

Store your `GITHUB_TOKEN` as an environment variable in the function, then proxy requests to GitHub's API.

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
Settings → Pages:
- **Source**: Select **GitHub Actions** (not "Deploy from a branch")
- Save

**Why GitHub Actions source?**
- Multiple workflows can deploy (on push, on schedule, on demand)
- No extra `gh-pages` branch to manage
- Workflows control when/how to build and deploy
- Better for dynamic content that updates frequently
- Modern best practice (same as Vercel, Netlify)

Your site will be at: `https://[username].github.io/[repo-name]`

**Note**: Deploy workflows will fail until Pages is enabled. Once enabled, they'll work automatically.

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

## The Feedback Loop

```
External data → Claude fetches → Updates data/ → Deploys site
                                         ↓
                        Claude improves UI → Creates PR
                                         ↓
                            Claude reviews PR → Auto-merge
                                         ↓
                                  [Updated site]
```

In parallel:
- `meta-manager.yml` analyzes and optimizes workflows
- `self-repair.yml` attempts to fix failures
- `auto-improve.yml` suggests code improvements
- `todo-worker.yml` implements tasks from TODO.md

The goal is autonomous infrastructure that iterates on itself. Success varies.

## Files

- `data/` - Data directory (nytimes.json, glif.json, weather.json, crypto-prices.json)
- `data.json` - Legacy data store (still supported for backward compatibility)
- `TODO.md` - Ideas and tasks for Claude to implement
- `.github/workflows/` - All workflow definitions
- `scripts/` - Debug and repair utilities
- `scripts/build-dashboard.js` - Builds static website from data files
- `.claude/commands/` - Custom slash commands (Markdown)
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

Experimental playground for autonomous AI infrastructure. What happens when Claude can:
- Read external data sources
- Modify its own codebase
- Review and merge its own changes
- Attempt to fix its own failures
- Respond to developer requests

Add ideas to TODO.md and Claude will attempt to build them. This is a sandbox for exploring the possibilities and limitations of AI-driven development workflows.

## Live Demo

**Website**: https://jamiew.github.io/claude-gha-demo

The dashboard updates automatically as workflows run and fetch new data.
