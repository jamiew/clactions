---
description: Analyze and fix failed GitHub Actions workflows
argument-hint: "[run-id]"
allowed-tools: Bash, Read, Write, Edit
---

# Fix Failed Workflows

Analyze and repair failed GitHub Actions workflow runs.

## Task

1. Determine which workflow run to analyze:
   - If `$1` is provided, use that run ID
   - Otherwise, find the most recent failed run: `gh run list --limit 50 --json conclusion,databaseId --jq '.[] | select(.conclusion == "failure") | .databaseId' | head -1`

2. Gather failure information:
   - Get run details: `gh run view $RUN_ID`
   - Get failed logs: `gh run view $RUN_ID --log-failed`
   - Get workflow name and metadata

3. Analyze the failure:
   - Identify root cause from logs
   - Check for common issues:
     - GitHub Pages not enabled
     - Missing secrets (ANTHROPIC_API_KEY, GLIF_API_TOKEN)
     - Workflow permissions (need read/write)
     - Missing data.json file
     - YAML syntax errors
     - API rate limits
     - Invalid action versions

4. Implement the fix:
   - For simple issues: Fix files and commit directly
   - For complex changes: Create a PR with explanation
   - For setup issues: Document what needs manual configuration

5. Provide summary:
   - What was broken
   - What you fixed
   - How you fixed it (commit/PR/manual)
   - Next steps if any

## Usage

```
/fix-workflows
/fix-workflows 123456789
```

## Notes

This command works with the `self-repair.yml` workflow which auto-triggers on failures.
You can also run the analysis scripts manually:
- `./scripts/analyze-workflow-runs.sh` - Quick check
- `./scripts/claude-workflow-doctor.sh` - Full diagnosis
