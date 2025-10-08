#!/bin/bash
# Handler for /fix-workflows command
# This can be called from Claude Code TUI or GitHub Actions

set -e

RUN_ID="${1:-}"

echo "🔧 Claude Workflow Repair Agent"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Determine which run to fix
if [ -z "$RUN_ID" ]; then
  echo "🔍 Finding most recent failed workflow run..."
  RUN_ID=$(gh run list --limit 50 --json conclusion,databaseId \
    --jq '.[] | select(.conclusion == "failure") | .databaseId' | head -1)

  if [ -z "$RUN_ID" ]; then
    echo "✅ No failed runs found! All workflows are healthy."
    exit 0
  fi

  echo "📍 Found failed run: $RUN_ID"
fi

# Get workflow details
echo "📋 Gathering failure information..."
WORKFLOW_NAME=$(gh run view "$RUN_ID" --json name --jq '.name' 2>/dev/null || echo "unknown")
WORKFLOW_FILE=$(gh run view "$RUN_ID" --json workflowName --jq '.workflowName' 2>/dev/null || echo "unknown")

echo "   Workflow: $WORKFLOW_NAME"
echo "   Run ID: $RUN_ID"
echo ""

# Create temp directory for analysis
ANALYSIS_DIR="/tmp/claude-workflow-fix-$$"
mkdir -p "$ANALYSIS_DIR"

# Gather all the data
gh run view "$RUN_ID" > "$ANALYSIS_DIR/run-details.txt" 2>&1 || true
gh run view "$RUN_ID" --json url,conclusion,headBranch,event,workflowName > "$ANALYSIS_DIR/run-metadata.json" 2>&1 || true
gh run view "$RUN_ID" --log-failed > "$ANALYSIS_DIR/run-logs.txt" 2>&1 || true

# Output the context for Claude Code subagent
cat > "$ANALYSIS_DIR/repair-context.md" << EOF
# Workflow Repair Request

## Failed Workflow Details

**Workflow Name**: $WORKFLOW_NAME
**Run ID**: $RUN_ID
**Workflow File**: $WORKFLOW_FILE

## Run Details

\`\`\`
$(cat "$ANALYSIS_DIR/run-details.txt")
\`\`\`

## Failed Logs

\`\`\`
$(tail -200 "$ANALYSIS_DIR/run-logs.txt" 2>/dev/null || echo "No logs available")
\`\`\`

## Metadata

\`\`\`json
$(cat "$ANALYSIS_DIR/run-metadata.json" 2>/dev/null || echo "{}")
\`\`\`

## Your Task

Analyze this workflow failure and fix it:

1. **Identify the root cause** from the logs and details above
2. **Determine the fix**:
   - If it's a code/config issue: Fix the workflow file or related code
   - If it's a missing file: Create it
   - If it's a setup issue: Document what needs to be configured manually
3. **Implement the fix**:
   - Update workflow files if needed
   - Create missing files (like data.json)
   - Add error handling
   - Update documentation
4. **Commit changes** directly to main (if safe) or create a PR (if complex)

## Common Issues to Check

- [ ] GitHub Pages not enabled (Settings → Pages → Source: GitHub Actions)
- [ ] Missing secrets (ANTHROPIC_API_KEY, GLIF_API_TOKEN)
- [ ] Workflow permissions (need read/write)
- [ ] Missing data.json file
- [ ] Syntax errors in YAML
- [ ] API rate limits or network failures
- [ ] Invalid action versions
- [ ] File path issues

## Output

After fixing, provide:
- Summary of what was broken
- What you fixed
- Whether it was committed or PR'd
- Any manual steps needed

EOF

echo "📄 Analysis context prepared at: $ANALYSIS_DIR/repair-context.md"
echo ""

# Output the path for subagent to read
echo "REPAIR_CONTEXT_FILE=$ANALYSIS_DIR/repair-context.md"
echo "ANALYSIS_DIR=$ANALYSIS_DIR"
echo "RUN_ID=$RUN_ID"
echo "WORKFLOW_NAME=$WORKFLOW_NAME"
