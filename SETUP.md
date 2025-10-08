# Setup Checklist

Quick setup guide for getting the automation running.

## ✅ Completed

- [x] Repository created
- [x] Workflows configured
- [x] CLAUDE_CODE_OAUTH_TOKEN secret added
- [x] GLIF_API_TOKEN secret added
- [x] GLIF_WORKFLOW_ID secret added (weather workflow)
- [x] Fixed workflows to use correct OAuth token
- [x] Removed invalid `create_pr` parameters
- [x] Updated repo description and homepage URL

## 🔧 Manual Steps Required

### 1. Enable GitHub Pages
**This must be done manually via web interface:**

1. Go to https://github.com/jamiew/claude-gha-demo/settings/pages
2. Under "Build and deployment":
   - Source: **GitHub Actions** (not "Deploy from a branch")
3. Click Save

Your site will be at: **https://jamiew.github.io/claude-gha-demo**

### 2. Create data.json
The workflows expect this file to exist:

```bash
echo '{"message": "Initial data", "last_updated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > data.json
git add data.json
git commit -m "Add initial data.json"
git push
```

### 3. Set Workflow Permissions
If workflows fail with permission errors:

1. Go to https://github.com/jamiew/claude-gha-demo/settings/actions
2. Under "Workflow permissions":
   - Select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Click Save

## 🚀 Trigger First Runs

Once Pages is enabled and data.json exists:

```bash
# Test the weather Glif
gh workflow run run-glif.yml

# Test NY Times scraper
gh workflow run fetch-nytimes.yml

# Test Glif content fetcher
gh workflow run fetch-glif.yml

# Let Claude pick a TODO and implement it
gh workflow run todo-worker.yml
```

## 🔍 Monitor Progress

```bash
# Watch runs
gh run watch

# List recent runs
gh run list --limit 10

# Check specific run
gh run view <run-id> --log
```

## 📊 Expected Behavior

Once everything is set up:

1. **Every 15 min**: Weather updates from Glif
2. **Every 30 min**: NY Times headlines
3. **Every 2 hours**: Glif featured content
4. **Every 6 hours**: Claude auto-improves the repo
5. **Every 8 hours**: TODO worker implements tasks
6. **Every 12 hours**: UI improvements
7. **Weekly**: Meta-manager optimizes workflows
8. **On failure**: Self-repair auto-fixes issues
9. **On PR**: Claude reviews code
10. **On approval**: Auto-merge

The site updates automatically as data comes in!

## 🐛 If Things Fail

The self-repair workflow should catch most issues, but you can also:

```bash
# Analyze failures
./scripts/analyze-workflow-runs.sh

# Deep diagnosis
./scripts/claude-workflow-doctor.sh

# Manual self-repair
gh workflow run self-repair.yml
```

## 🌐 Your GitHub Pages URL

https://jamiew.github.io/claude-gha-demo

(Will be live once Pages is enabled and first deploy succeeds)
