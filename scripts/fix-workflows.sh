#!/bin/bash
# Handler for self-repair workflow - gathers context for Claude

set -e

RUN_ID="${1:-}"

if [ -z "$RUN_ID" ]; then
  RUN_ID=$(gh run list --limit 50 --json conclusion,databaseId \
    --jq '.[] | select(.conclusion == "failure") | .databaseId' | head -1)
fi

if [ -z "$RUN_ID" ]; then
  echo "No failed runs found"
  exit 0
fi

# Get workflow details
WORKFLOW_NAME=$(gh run view "$RUN_ID" --json name --jq '.name' 2>/dev/null || echo "unknown")

# Create temp directory
ANALYSIS_DIR="/tmp/workflow-repair-$$"
mkdir -p "$ANALYSIS_DIR"

# Gather data
gh run view "$RUN_ID" > "$ANALYSIS_DIR/run-details.txt" 2>&1 || true
gh run view "$RUN_ID" --json url,conclusion,headBranch,event,workflowName > "$ANALYSIS_DIR/run-metadata.json" 2>&1 || true
gh run view "$RUN_ID" --log-failed > "$ANALYSIS_DIR/run-logs.txt" 2>&1 || true

# Create context file
cat > "$ANALYSIS_DIR/repair-context.md" << EOF
# Workflow Repair Context

**Run ID**: $RUN_ID
**Workflow**: $WORKFLOW_NAME

## Run Details

\`\`\`
$(cat "$ANALYSIS_DIR/run-details.txt")
\`\`\`

## Failed Logs

\`\`\`
$(tail -200 "$ANALYSIS_DIR/run-logs.txt" 2>/dev/null || echo "No logs")
\`\`\`

## Metadata

\`\`\`json
$(cat "$ANALYSIS_DIR/run-metadata.json" 2>/dev/null || echo "{}")
\`\`\`

## Task

Analyze this failure and fix it:
1. Identify root cause
2. Fix workflow YAML, create missing files, or document manual setup needed
3. Commit directly for simple fixes, create PR for complex changes
4. Provide summary of what was broken and how you fixed it

## Common Issues

- Pages not enabled (Settings → Pages)
- Missing secrets (ANTHROPIC_API_KEY, GLIF_API_TOKEN)
- Wrong permissions (need read/write)
- Missing data.json
- YAML syntax errors
- API rate limits
EOF

# Output paths for workflow to use (quoted for safe sourcing)
echo "REPAIR_CONTEXT_FILE='$ANALYSIS_DIR/repair-context.md'"
echo "ANALYSIS_DIR='$ANALYSIS_DIR'"
echo "RUN_ID='$RUN_ID'"
echo "WORKFLOW_NAME='$WORKFLOW_NAME'"
