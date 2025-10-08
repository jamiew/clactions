# Workflow Repair Subagent

This subagent specializes in analyzing and fixing failed GitHub Actions workflows.

## Purpose

Automatically diagnose and repair failed workflow runs using Claude's analysis capabilities.

## How It Works

1. **Detection**: Triggered when a workflow fails (or manually via `/fix-workflows`)
2. **Analysis**: Gathers failure logs, run details, and metadata
3. **Diagnosis**: Claude identifies the root cause
4. **Repair**: Claude implements the appropriate fix
5. **Validation**: Optionally re-runs the workflow to verify fix

## Usage

### From Claude Code TUI

```
/fix-workflows [run-id]
```

Without a run ID, it fixes the most recent failure.

### From GitHub Actions

The `claude-self-repair.yml` workflow runs automatically:
- When any workflow fails
- Every 30 minutes (checks for failures)
- Manually via workflow dispatch

### Manual Trigger

```bash
# Let it find the latest failure
gh workflow run claude-self-repair.yml

# Fix specific run
gh workflow run claude-self-repair.yml -f run_id=123456789
```

## Repair Strategy

### Automatic Fixes (Direct Commit)
- Missing data files (creates with sensible defaults)
- Simple YAML syntax errors
- Outdated action versions
- File path corrections

### PR-Based Fixes (Complex Changes)
- Workflow logic changes
- Major refactoring
- Multiple file changes
- Changes that need review

### Issue Creation (Manual Setup Required)
- GitHub Pages not enabled
- Missing repository secrets
- Permission changes needed
- External service configuration

## Common Issues Detected

1. **Missing Files**
   - data.json not found → Creates with initial content
   - Workflow file path issues → Corrects paths

2. **Configuration Issues**
   - GitHub Pages not enabled → Creates issue with instructions
   - Missing secrets → Creates issue listing required secrets
   - Wrong permissions → Updates workflow or creates issue

3. **Code Issues**
   - YAML syntax errors → Fixes syntax
   - Invalid action versions → Updates to latest stable
   - Broken scripts → Fixes or adds error handling

4. **Transient Issues**
   - API rate limits → Adds retry logic or reduces frequency
   - Network timeouts → Adds timeout configuration
   - Race conditions → Adds proper sequencing

## Integration Points

- **TUI Command**: `/fix-workflows` in Claude Code
- **GitHub Action**: `claude-self-repair.yml`
- **Script**: `.claude/handlers/fix-workflows.sh`
- **Auto-Trigger**: Runs on any workflow failure

## Output

The subagent provides:
- Root cause analysis
- Fix description
- Implementation method (commit/PR/issue)
- Follow-up actions if needed
- Link to fixed workflow or PR

## Example Workflow

```
User: /fix-workflows

→ Handler finds latest failed run (ID: 123456789)
→ Gathers logs and metadata
→ Claude subagent analyzes failure
→ Root cause: data.json missing
→ Creates data.json with initial content
→ Commits to main branch
→ Reports: "Created missing data.json file. Workflow should now succeed."
```

## Future Enhancements

- [ ] Pattern detection across multiple failures
- [ ] Learning from past fixes
- [ ] Proactive prevention suggestions
- [ ] Auto-retry after successful fix
- [ ] Slack/Discord notifications
- [ ] Metrics dashboard of fix success rate
