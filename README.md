# Claude GitHub Actions Playground

Experimental sandbox for combining Claude Code with GitHub Actions. Claude fetches data, updates websites, creates PRs, reviews code, and attempts to fix its own failures.

## What This Tests

This repo explores autonomous AI infrastructure across five categories:
1. **Data Fetchers & Scrapers** - Claude fetches external data and updates the website
2. **Autonomous Development** - Claude modifies the codebase, triages issues, and implements tasks
3. **Self-Improvement & Meta** - Claude improves its own setup and fixes its own failures
4. **Webhooks & External Triggers** - External services can trigger Claude workflows
5. **Build & Deploy** - Website generation and deployment automation

Additionally, Claude Code's built-in features are installed via `/install-github-app`:
- **@claude mentions in issues** - Comment `@claude` to get implementation PRs
- **Code Review** - Claude reviews all PRs automatically

**11 of 15 documented workflows** use Claude Code for decision-making and implementation.

## Workflows

### Data Fetchers & Scrapers
Claude fetches external data and updates data used to generate the website.

| Workflow | Prompt for Claude | Uses Claude | Commits | Opens Issues | Opens PRs |
|----------|-------------------|-------------|---------|--------------|-----------|
| [nytimes-headlines.yml](.github/workflows/nytimes-headlines.yml) | Parse NYT RSS feed → `data/nytimes.json` | ✅ | ✅ | ❌ | ❌ |
| [glif-top-content.yml](.github/workflows/glif-top-content.yml) | Fetch Glif featured content → `data/glif.json` | ✅ | ✅ | ❌ | ❌ |
| [weather-data.yml](.github/workflows/weather-data.yml) | Fetch NYC weather → `data/weather.json` | ✅ | ✅ | ❌ | ❌ |
| [crypto-prices.yml](.github/workflows/crypto-prices.yml) | Fetch BTC/ETH/SOL/HNT prices via **CoinGecko MCP server** → `data/crypto-prices.json` | ✅ | ✅ | ❌ | ❌ |
| [rhizome-community.yml](.github/workflows/rhizome-community.yml) | Scrape Rhizome.org community → `data/rhizome.json` | ✅ | ✅ | ❌ | ❌ |
| [adaptive-theme.yml](.github/workflows/adaptive-theme.yml) | Generate CSS based on time/season/weather → `theme-nyc.css` | ✅ | ✅ | ❌ | ❌ |

### Autonomous Development
Claude modifies its own codebase and implements tasks.

| Workflow | Prompt for Claude | Uses Claude | Commits | Opens Issues | Opens PRs |
|----------|-------------------|-------------|---------|--------------|-----------|
| [todo-worker.yml](.github/workflows/todo-worker.yml) | Read TODO.md → pick task → implement via PR | ✅ | ❌ | ❌ | ✅ |
| [issue-triage.yml](.github/workflows/issue-triage.yml) | Analyze issue → apply labels → ask clarifying questions | ✅ | ❌ | ❌ | ❌ |
| [auto-merge.yml](.github/workflows/auto-merge.yml) | Auto-merge approved Claude PRs | ❌ | ❌ | ❌ | ❌ |

### Self-Improvement & Meta
Claude improves its own setup and fixes its own failures.

| Workflow | Prompt for Claude | Uses Claude | Commits | Opens Issues | Opens PRs |
|----------|-------------------|-------------|---------|--------------|-----------|
| [self-repair.yml](.github/workflows/self-repair.yml) | Read failure logs → diagnose → fix (commit or PR) | ✅ | ✅ | ✅ | ✅ |
| [self-improver.yml](.github/workflows/self-improver.yml) | Analyze changes → improve CLAUDE.md & Claude Code setup via PR | ✅ | ❌ | ❌ | ✅ |
| [update-docs.yml](.github/workflows/update-docs.yml) | Generate workflow docs → create docs/*.md & data/docs.json | ✅ | ✅ | ❌ | ❌ |

### Webhooks & External Triggers
External services can trigger workflows via GitHub's `repository_dispatch` API.

| Workflow | Prompt for Claude | Uses Claude | Commits | Opens Issues | Opens PRs |
|----------|-------------------|-------------|---------|--------------|-----------|
| [webhook-demo.yml](.github/workflows/webhook-demo.yml) | Echo webhook payload for testing | ❌ | ❌ | ❌ | ❌ |
| [cross-repo-notify.yml](.github/workflows/cross-repo-notify.yml) | Detect workflow changes → create issue in external repo | ❌ | ❌ | ✅ | ❌ |

### Build & Deploy
Website generation and deployment automation.

| Workflow | Prompt for Claude | Uses Claude | Commits | Opens Issues | Opens PRs |
|----------|-------------------|-------------|---------|--------------|-----------|
| [update-website.yml](.github/workflows/update-website.yml) | Build website from data files → deploy to Pages | ❌ | ❌ | ❌ | ❌ |

## How It Works

The system operates through several categories of workflows that work together:

### Data Collection & Theming
- `nytimes-headlines.yml`, `weather-data.yml`, `crypto-prices.yml`, etc. fetch external data
- `adaptive-theme.yml` generates CSS based on time/season/weather
- All commit directly to main → trigger website rebuild

### Development Automation
- `todo-worker.yml` implements tasks from TODO.md via PRs
- `issue-triage.yml` analyzes and labels new issues
- `auto-merge.yml` merges approved Claude PRs automatically

### Self-Improvement & Meta
These workflows improve the system itself:

**[self-repair.yml](.github/workflows/self-repair.yml)** - Autonomous error recovery:
1. Detects workflow failures
2. Analyzes logs and identifies root cause
3. Implements fix (commit or PR based on complexity)
4. Re-runs the failed workflow
5. Runs hourly to catch stragglers

**[self-improver.yml](.github/workflows/self-improver.yml)** - Claude Code setup optimization:
- Analyzes merged PRs and issue discussions
- Improves CLAUDE.md, slash commands, subagent docs
- Acts when users say "update Claude rules", "DRY this up", etc.
- Creates PRs with setup improvements

**[update-docs.yml](.github/workflows/update-docs.yml)** - Documentation generation:
- Creates `docs/*.md` for each workflow
- Generates `data/docs.json` metadata
- Runs weekly, commits directly to main
- Website includes these docs automatically

**Trigger self-repair manually:**
```bash
gh workflow run self-repair.yml
# Or from Claude Code CLI
/fix-workflows [run-id]
```

**Success rate:** Variable. Claude can fix simple issues (missing files, permission errors, API changes) but struggles with complex logic bugs.

## Workflow Commands

Manage workflows with `gh`:

```bash
# List all workflows
gh workflow list

# Run a workflow
gh workflow run nytimes-headlines.yml
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

Example: Manually trigger NY Times headlines:
```bash
gh workflow run nytimes-headlines.yml && gh run watch
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
   - **Repository access**: Select **"Only select repositories"** → Choose your repo
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

Diagnose workflow failures:
```bash
./scripts/debug-workflows.sh
```

## Setup

### 1. Enable GitHub Actions
Settings → Actions → General → **Allow all actions**

### 2. Add Secrets
Settings → Secrets and variables → Actions → New repository secret

**Required:**
- `CLAUDE_CODE_OAUTH_TOKEN` - From Claude Code GitHub App install

**Optional:**
- `GLIF_API_TOKEN` - From https://glif.app (for Glif featured content integration)
- `CROSS_REPO_PAT` - Personal Access Token for cross-repo notifications (only needed if using cross-repo-notify workflows)

#### Creating CROSS_REPO_PAT (Optional)

Only needed if you want to use the `cross-repo-notify.yml` workflow to send notifications to another repo.

1. Go to https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"**
3. Configure:
   - **Token name**: `cross-repo-pat`
   - **Expiration**: 1 year (or your preference)
   - **Repository access**: **Public Repositories (read-only)** (or select specific repos)
   - **Permissions** → Repository permissions:
     - **Issues**: **Read and write** ✅
4. Click **"Generate token"** and copy it
5. Add to this repo: Settings → Secrets → Actions → New secret
   - Name: `CROSS_REPO_PAT`
   - Value: paste the token

### 3. Configure Permissions
Settings → Actions → General → Workflow permissions:
- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**

### 4. Enable GitHub Pages

**This must be done manually via web interface:**

1. Go to Settings → Pages
2. Under "Build and deployment":
   - **Source**: Select **GitHub Actions** (NOT "Deploy from a branch")
3. Click Save

Your site will be at: `https://[username].github.io/[repo-name]`

**Why GitHub Actions source?**
- Multiple workflows can deploy (on push, on schedule, on demand)
- No extra `gh-pages` branch to manage
- Workflows control when/how to build and deploy
- Better for dynamic content that updates frequently
- Modern best practice (same as Vercel, Netlify)

**Note**: Deploy workflows will fail until Pages is enabled. Once enabled, they'll work automatically.

**Verify Pages is enabled:**
```bash
# Check if Pages is enabled
gh api repos/jamiew/claude-gha-demo/pages

# Should return Pages config, not 404
```

### 5. Install Claude Code GitHub App Features

Install built-in features using Claude Code CLI:
```bash
/install-github-app
```

This enables:
- **@claude mentions in issues** - Create an issue and mention `@claude` to get an implementation PR
- **Automated Code Review** - Claude reviews all PRs automatically

### 6. YOLO Mode (Optional but Recommended)
For maximum autonomy, enable auto-merge:

**Settings → General:**
- ✅ **Allow auto-merge** (lets Claude merge its own PRs)
- ✅ **Automatically delete head branches** (cleanup after merge)

This lets the system truly run itself. Claude creates PRs → reviews them → auto-merges → deletes branches. Full autonomy.

## The Feedback Loop

```
External data → Claude fetches → Updates data/ → Deploys site
                                         ↓
                        Claude improves code → Creates PR
                                         ↓
                            Claude reviews PR → Auto-merge
                                         ↓
                                  [Updated site]
```

In parallel:
- `self-improver.yml` improves Claude Code setup based on learnings
- `update-docs.yml` generates workflow documentation
- `self-repair.yml` attempts to fix failures
- `todo-worker.yml` implements tasks from TODO.md
- `issue-triage.yml` organizes and labels incoming issues

The goal is autonomous infrastructure that iterates on itself. Success varies.

## Files

- `data/` - Data directory (nytimes.json, glif.json, weather.json, crypto-prices.json, rhizome.json, docs.json)
- `data.json` - Legacy data store (still supported for backward compatibility)
- `docs/` - Auto-generated workflow documentation (created by `update-docs.yml`)
- `TODO.md` - Ideas and tasks for Claude to implement
- `.github/workflows/` - All workflow definitions
- `scripts/` - Debug and repair utilities
  - `scripts/build-dashboard.js` - Builds static website from data files
  - `scripts/debug-workflows.sh` - Diagnose workflow failures
  - `scripts/fix-workflows.sh` - Gather context for self-repair workflow
- `.claude/commands/` - Custom slash commands (Markdown)
- `.claude/subagents/` - Subagent documentation
- `theme-nyc.css` - Adaptive CSS theme generated based on time/weather

## Glif Integration

Fetches top workflows/agents via API and displays them on the site.

## Common Issues

**Pages not enabled**: Settings → Pages → Source: GitHub Actions

**Missing secrets**: Settings → Secrets → `CLAUDE_CODE_OAUTH_TOKEN`

**Permission denied**: Settings → Actions → Workflow permissions → Read/write

**data.json missing**: Create it: `{"message": "Initial data"}`

Let `self-repair.yml` fix most issues automatically.

## TODO-Driven Development

Add ideas to `TODO.md`. The `todo-worker.yml` workflow reads it regularly, picks feasible tasks, and implements them via PRs.

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
