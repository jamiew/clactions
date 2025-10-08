#!/bin/bash
# Quick analysis of GitHub Actions workflow runs

set -e

echo "🔍 Analyzing GitHub Actions Workflow Runs..."
echo ""

# Get failed runs
echo "❌ Failed Runs (last 20):"
gh run list --limit 20 --json conclusion,name,databaseId,startedAt,displayTitle \
  --jq '.[] | select(.conclusion == "failure") | "  [\(.databaseId)] \(.name) - \(.displayTitle)"' || echo "  None found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get recent runs summary
echo "📊 Success Rate by Workflow:"
gh run list --limit 50 --json conclusion,name \
  --jq 'group_by(.name) | .[] | {workflow: .[0].name, total: length, success: ([.[] | select(.conclusion == "success")] | length)} | "\(.workflow): \(.success)/\(.total)"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get most recent failed run details
FAILED_RUN=$(gh run list --limit 1 --json conclusion,databaseId --jq '.[] | select(.conclusion == "failure") | .databaseId')

if [ -n "$FAILED_RUN" ]; then
  echo "🔴 Most Recent Failed Run: $FAILED_RUN"
  echo ""
  echo "View logs: gh run view $FAILED_RUN --log-failed"
  echo "Auto-fix: gh workflow run self-repair.yml -f run_id=$FAILED_RUN"
  echo "Or: /fix-workflows $FAILED_RUN"
else
  echo "✅ No failed runs found!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Common Fixes:"
echo "  - Pages not enabled: Settings → Pages → Source: GitHub Actions"
echo "  - Missing secrets: Settings → Secrets → ANTHROPIC_API_KEY"
echo "  - Permissions: Settings → Actions → Workflow permissions → Read/write"
echo "  - data.json: Create with {\"message\": \"Initial data\"}"
