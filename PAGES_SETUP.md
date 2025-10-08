# GitHub Pages Setup

**Your Pages site will be at:** https://jamiew.github.io/claude-gha-demo

## Why It's Not Working Yet

GitHub Pages must be **manually enabled** via the web interface. There's no API or CLI command to enable it.

## How to Enable

1. Go to: https://github.com/jamiew/claude-gha-demo/settings/pages

2. Under "Build and deployment":
   - **Source**: Select **GitHub Actions**
   - (NOT "Deploy from a branch")

3. Click **Save**

## What Happens Next

Once enabled:
1. The `deploy-pages.yml` workflow will run on next push
2. It generates HTML from data.json
3. Publishes to: https://jamiew.github.io/claude-gha-demo
4. No `gh-pages` branch needed (Actions mode deploys directly)

## Why No gh-pages Branch?

When using **GitHub Actions** as the source (vs. "Deploy from a branch"):
- No `gh-pages` branch is created
- Deploys come from workflow artifacts
- Cleaner repo structure

## Manual Test Deploy

After enabling Pages, trigger a deploy:

```bash
# Push any change to trigger deploy
git commit --allow-empty -m "Test Pages deploy"
git push

# Or run workflow manually
gh workflow run deploy-pages.yml

# Watch it
gh run watch
```

## Verify It Works

```bash
# Check if Pages is enabled
gh api repos/jamiew/claude-gha-demo/pages

# Should return Pages config, not 404
```

Once you see a successful deploy run, visit:
**https://jamiew.github.io/claude-gha-demo** 🎉
