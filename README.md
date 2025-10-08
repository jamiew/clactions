# Claude GitHub Actions Automaton

A self-improving, Claude-powered automation system that uses GitHub Actions to manage itself and generate content.

## What We've Built So Far

### 🤖 Autonomous Claude Agent System
We've created a fully autonomous system where Claude manages and improves itself through GitHub Actions:

1. **Auto-Improvement Loop** (`claude-auto-improve.yml`)
   - Runs every 6 hours
   - Claude analyzes the repo and makes improvements autonomously
   - Creates PRs with enhancements (better scrapers, new features, UI improvements)

2. **Claude PR Reviewer** (`claude-pr-review.yml`)
   - Reviews ALL pull requests automatically
   - Checks code quality, security, and best practices
   - Approves good PRs or requests changes

3. **Auto-Merge** (`auto-merge.yml`)
   - Automatically merges Claude-created PRs when:
     - Approved by Claude reviewer
     - All checks pass
     - No conflicts

4. **Meta-Manager** (`claude-meta-manager.yml`)
   - Runs weekly
   - Claude manages its own workflow configurations!
   - Optimizes cron schedules, adds/removes workflows, updates actions

### 📰 Content Automation
- **NY Times Scraper** (`fetch-nytimes.yml`): Fetches top headlines every 30 minutes
- **Glif Content Fetcher** (`fetch-glif-content.yml`): Gets top Glif workflows and agents every 2 hours
- **Glif Runner** (`run-glif.yml`): Runs a Glif workflow every 15 minutes, Claude processes the output
- **Auto-Deploy** (`deploy-pages.yml`): Publishes to GitHub Pages on every update
- **Scheduled Updates** (`scheduled-deploy.yml`): Hourly page regeneration with enhanced UI

### 🌐 GitHub Pages Website
Live site displays:
- 📰 Latest NY Times headlines
- 🎨 Top Glif workflows (featured)
- 🤖 Top Glif agents (featured)
- Auto-updated data feeds
- Beautiful card-based UI with hover effects
- Timestamps showing when content was last refreshed

## How It Works

The system is a **closed loop of AI-driven improvements**:

```
┌─────────────────────────────────────────────┐
│  Claude Auto-Improve (every 6 hours)        │
│  - Analyzes codebase                        │
│  - Makes improvements                       │
│  - Creates PR                               │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  Claude PR Review (on PR creation)          │
│  - Reviews code changes                     │
│  - Checks for issues                        │
│  - Approves or requests changes             │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  Auto-Merge (when approved + checks pass)   │
│  - Merges to main                           │
│  - Triggers deploys                         │
└─────────────┬───────────────────────────────┘
              │
              ▼
         [Repository improves itself] 🔄
```

## Setup Required

1. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. **Add API Keys as Repository Secrets**:
   - `ANTHROPIC_API_KEY`: Get from https://console.anthropic.com/
   - `GLIF_API_TOKEN`: Get from https://glif.app (for API access)
   - `GLIF_WORKFLOW_ID`: (Optional) Specific Glif workflow to run automatically

3. **Install Claude Code GitHub App** (already done):
   - Enables Claude to create and review PRs

## Glif Integration 🎨

We've integrated with [Glif](https://glif.app), an AI workflow platform:

1. **Glif Content Fetcher**: Displays top featured workflows and agents on the site
2. **Glif Workflow Runner**: Automatically runs a Glif workflow, then Claude processes the output and updates the site

This creates a **Glif → Claude → GitHub Pages pipeline** for generative content!

## What's Next

- [ ] Add MCP server integration for external data sources
- [ ] Create workflow to submit PRs to other repositories
- [ ] Add more data sources (Reddit, Hacker News, etc.)
- [x] Integrate Glif workflows and agents
- [ ] Create Glif workflow that generates website content (images, text, etc.)
