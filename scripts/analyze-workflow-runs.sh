#!/bin/bash
# Analyze GitHub Actions workflow runs and identify issues

set -e

echo "🔍 Analyzing GitHub Actions Workflow Runs..."
echo ""

# Get failed runs
echo "❌ Failed Runs (last 50):"
gh run list --limit 50 --json conclusion,name,databaseId,startedAt,displayTitle \
  --jq '.[] | select(.conclusion == "failure") | "  [\(.databaseId)] \(.name) - \(.displayTitle) (\(.startedAt))"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get recent runs summary
echo "📊 Recent Runs Summary:"
gh run list --limit 20 --json conclusion,name \
  --jq 'group_by(.name) | .[] | {workflow: .[0].name, total: length, failed: ([.[] | select(.conclusion == "failure")] | length), success: ([.[] | select(.conclusion == "success")] | length)} | "  \(.workflow): \(.success)/\(.total) successful"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get most recent failed run details
FAILED_RUN=$(gh run list --limit 1 --json conclusion,databaseId --jq '.[] | select(.conclusion == "failure") | .databaseId')

if [ -n "$FAILED_RUN" ]; then
  echo "🔴 Most Recent Failed Run Details:"
  gh run view "$FAILED_RUN"

  echo ""
  echo "📋 Failed Run Logs:"
  gh run view "$FAILED_RUN" --log-failed | head -100

  echo ""
  echo "💡 To see full logs: gh run view $FAILED_RUN --log-failed"
else
  echo "✅ No failed runs found!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Common Issues & Fixes:"
echo ""
echo "1. Pages not enabled:"
echo "   → Go to Settings → Pages → Source: GitHub Actions"
echo ""
echo "2. Missing secrets:"
echo "   → Check Settings → Secrets → Actions"
echo "   → Required: ANTHROPIC_API_KEY, GLIF_API_TOKEN (optional)"
echo ""
echo "3. Workflow permissions:"
echo "   → Settings → Actions → Workflow permissions"
echo "   → Enable 'Read and write permissions'"
echo ""
echo "4. Data file missing:"
echo "   → Ensure data.json exists in repo root"
echo ""
