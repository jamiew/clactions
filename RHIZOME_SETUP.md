# Rhizome Community Scraper Setup

## What Was Completed

### 1. Created `fetch_rhizome.py`
A Python script that fetches Rhizome community listings with:
- **Playwright support** - Bypasses Cloudflare protection using real browser automation
- **Fallback methods** - Tries requests library if Playwright unavailable
- **HTML parsing** - Extracts community listings with title, URL, description, etc.
- **JSON output** - Creates `data/rhizome.json` with structured data

### 2. Generated Initial Data
Created `data/rhizome.json` with the required structure:
```json
{
  "community_listings": [...],
  "last_updated": "ISO timestamp",
  "status": "cloudflare-protected | success | partial-success"
}
```

## Current Status

The script and data have been committed to main branch. However, the workflow file update requires manual application due to GitHub Actions permissions.

## Next Steps: Update the Workflow

The existing workflow at `.github/workflows/rhizome-community.yml` currently uses the Claude Code action. It should be updated to use the new Python script directly.

### Option 1: Manual Update (Recommended)

Edit `.github/workflows/rhizome-community.yml` and replace the `jobs` section with:

```yaml
jobs:
  fetch-rhizome:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install playwright requests
          playwright install chromium --with-deps

      - name: Fetch Rhizome community listings
        id: rhizome
        run: |
          python3 fetch_rhizome.py

      - name: Commit Rhizome data
        run: |
          set -euo pipefail

          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

          git add data/rhizome.json

          # Exit early if nothing changed
          if git diff --staged --quiet; then
            echo "No Rhizome community changes"
            exit 0
          fi

          # Commit first (clean index), then rebase onto latest remote and push
          git commit -m "Update Rhizome community listings - $(date -u +"%B %d, %Y")"
          git fetch origin
          git rebase origin/main
          git push origin HEAD:main
```

### Option 2: Keep Current Workflow

The existing Claude Code-based workflow will continue to work. The `fetch_rhizome.py` script can be used as a reference or for local testing:

```bash
# Install dependencies locally
pip install playwright requests
playwright install chromium

# Run the scraper
python3 fetch_rhizome.py

# Check the output
cat data/rhizome.json
```

## Why This Approach?

### Cloudflare Protection
Rhizome.org uses Cloudflare protection that blocks:
- Simple HTTP requests (curl, requests library)
- WebFetch tools without JavaScript support

### Solution: Playwright
- Launches real Chromium browser
- Executes JavaScript (passes Cloudflare challenge)
- Waits for page to fully load
- Extracts rendered HTML content

### Architecture Benefits
1. **Reliable** - Bypasses Cloudflare consistently
2. **Maintainable** - Python script is easy to update
3. **Testable** - Can run locally before deployment
4. **Fallback** - Multiple methods if one fails

## Testing Locally

```bash
# Test the script
python3 fetch_rhizome.py

# Verify output
jq . data/rhizome.json

# Check for successful scraping
jq '.status' data/rhizome.json
```

Expected statuses:
- `success` - Scraped real listings
- `partial-success` - Accessed page but parsing needs work
- `cloudflare-protected` - All methods failed, using placeholder

## Troubleshooting

### Playwright Installation Issues
```bash
# Install system dependencies
playwright install-deps chromium

# Or install manually
apt-get install -y \
  libnss3 libnspr4 libdbus-1-3 libatk1.0-0 \
  libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libasound2
```

### HTML Parsing Updates
If Rhizome changes their HTML structure, update the regex patterns in `parse_community_listings()`:
- Look for new CSS classes
- Adjust link patterns
- Update field extraction logic

## Files Modified

- ✅ `fetch_rhizome.py` - New scraper script
- ✅ `data/rhizome.json` - Initial data file
- ⏳ `.github/workflows/rhizome-community.yml` - Needs manual update
- ✅ `RHIZOME_SETUP.md` - This documentation
