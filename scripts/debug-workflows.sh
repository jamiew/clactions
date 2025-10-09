#!/bin/bash
# Debug GitHub Actions workflow failures

set -e

echo "🔍 Workflow Diagnostics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Debug failed runs specifically
FAILED_RUN_LIMIT=10
FAILED_RUNS=$(gh run list --limit $FAILED_RUN_LIMIT --status failure --json conclusion,databaseId,name,displayTitle)
FAILED_COUNT=$(echo "$FAILED_RUNS" | jq 'length')

echo "❌ Failed Runs (last $FAILED_RUN_LIMIT):"
if [ "$FAILED_COUNT" -eq 0 ]; then
    echo "  None found"
else
    echo "$FAILED_RUNS" | jq -r '.[] | "  [\(.databaseId)] \(.name) - \(.displayTitle)"'
fi

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

# If no failures, exit
if [ "$FAILED_COUNT" -eq 0 ]; then
    echo "✅ No failed runs. All workflows healthy!"
    exit 0
fi

# Get latest failure
LATEST_ID=$(echo "$FAILED_RUNS" | jq -r '.[0].databaseId')
LATEST_NAME=$(echo "$FAILED_RUNS" | jq -r '.[0].name')

echo "🔴 Latest Failure: $LATEST_NAME (ID: $LATEST_ID)"
echo ""

# Get logs
LOG_FILE="/tmp/workflow-${LATEST_ID}.log"
gh run view "$LATEST_ID" > "$LOG_FILE" 2>&1 || true
gh run view "$LATEST_ID" --log-failed >> "$LOG_FILE" 2>&1 || true

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Full logs saved to: $LOG_FILE"
echo "🔗 View online: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/runs/$LATEST_ID"
echo ""
echo "🛠️  Next Steps:"
echo "  1. Fix manually based on suggestions above"
echo "  2. Or: gh workflow run self-repair.yml -f run_id=$LATEST_ID"
echo ""
