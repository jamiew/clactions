# analyze-workflows

Analyze GitHub Actions workflow runs and fix common issues

## Usage

```bash
/analyze-workflows
```

## Description

This command:
1. Lists all failed workflow runs
2. Shows a summary of success/failure rates per workflow
3. Displays detailed logs from the most recent failure
4. Suggests fixes for common issues
5. Can optionally invoke Claude to auto-fix issues

## Implementation

Runs `scripts/analyze-workflow-runs.sh` and optionally uses Claude Code Action to fix issues.
