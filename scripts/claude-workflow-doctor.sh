#!/bin/bash
# Claude Workflow Doctor - Interactive workflow debugging with Claude

set -e

echo "🩺 Claude Workflow Doctor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not logged into GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Get failed runs
echo "🔍 Checking for failed workflow runs..."
FAILED_RUNS=$(gh run list --limit 10 --json conclusion,databaseId,name,displayTitle \
  --jq '[.[] | select(.conclusion == "failure")]')

FAILED_COUNT=$(echo "$FAILED_RUNS" | jq 'length')

if [ "$FAILED_COUNT" -eq 0 ]; then
    echo "✅ No failed runs found! All workflows are healthy."
    exit 0
fi

echo "Found $FAILED_COUNT failed run(s)"
echo ""
echo "$FAILED_RUNS" | jq -r '.[] | "  [\(.databaseId)] \(.name) - \(.displayTitle)"'
echo ""

# Get most recent failed run
LATEST_FAILED=$(echo "$FAILED_RUNS" | jq -r '.[0].databaseId')
LATEST_NAME=$(echo "$FAILED_RUNS" | jq -r '.[0].name')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴 Analyzing most recent failure: $LATEST_NAME"
echo "Run ID: $LATEST_FAILED"
echo ""

# Get logs
mkdir -p /tmp/claude-workflow-doctor
LOG_FILE="/tmp/claude-workflow-doctor/run-${LATEST_FAILED}.log"
DETAILS_FILE="/tmp/claude-workflow-doctor/run-${LATEST_FAILED}-details.txt"

gh run view "$LATEST_FAILED" > "$DETAILS_FILE"
gh run view "$LATEST_FAILED" --log-failed > "$LOG_FILE" 2>&1 || true

echo "📋 Failure Details:"
cat "$DETAILS_FILE"
echo ""
echo "📜 Failure Logs (last 50 lines):"
tail -50 "$LOG_FILE"
echo ""

# Check if Claude CLI is available
if command -v claude &> /dev/null; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🤖 Invoking Claude to analyze failure..."
    echo ""

    claude << EOF
Analyze this GitHub Actions workflow failure and suggest fixes:

Workflow: $LATEST_NAME
Run ID: $LATEST_FAILED

Details:
$(cat "$DETAILS_FILE")

Failed logs:
$(tail -100 "$LOG_FILE")

Please:
1. Identify the root cause
2. Suggest specific fixes
3. Provide commands to implement the fix if applicable
4. Note if manual configuration is needed (like enabling GitHub Pages or adding secrets)
EOF
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 Suggested Actions:"
    echo ""

    # Check for common errors
    if grep -q "Pages.*not.*enabled" "$LOG_FILE"; then
        echo "❌ GitHub Pages not enabled"
        echo "   Fix: Go to Settings → Pages → Source: GitHub Actions"
        echo ""
    fi

    if grep -q "secret.*not.*found" "$LOG_FILE" 2>/dev/null || grep -q "ANTHROPIC_API_KEY" "$LOG_FILE" 2>/dev/null; then
        echo "❌ Missing API secrets"
        echo "   Fix: Add secrets in Settings → Secrets → Actions"
        echo "   Required: ANTHROPIC_API_KEY"
        echo ""
    fi

    if grep -q "permission denied\|403" "$LOG_FILE" 2>/dev/null; then
        echo "❌ Permission issues"
        echo "   Fix: Settings → Actions → Workflow permissions → Enable 'Read and write'"
        echo ""
    fi

    if grep -q "data.json.*not found\|ENOENT.*data.json" "$LOG_FILE" 2>/dev/null; then
        echo "❌ Missing data.json file"
        echo "   Fix: Create data.json with initial content"
        echo ""
    fi

    echo "📁 Full logs saved to:"
    echo "   Details: $DETAILS_FILE"
    echo "   Logs: $LOG_FILE"
    echo ""
    echo "🔗 View online: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/runs/$LATEST_FAILED"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🛠️  Next Steps:"
echo ""
echo "1. Fix the issue manually based on suggestions above"
echo "2. Or run: gh workflow run claude-fix-workflows.yml -f run_id=$LATEST_FAILED"
echo "3. Or re-run the failed workflow: gh run rerun $LATEST_FAILED"
echo ""
