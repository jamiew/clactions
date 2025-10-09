#!/usr/bin/env python3
"""
Analyze workflow changes using Claude API and generate a changelog.
Usage: python analyze-workflow-changes.py <mode> <diff-file> <output-file>
  mode: 'by-commit' or 'unified'
"""

import sys
import os
import anthropic

def analyze_by_commit(diff_content):
    """Analyze changes commit-by-commit"""
    prompt = f"""Analyze the workflow changes below (individual commit diffs from the last 8 hours).

Create a comprehensive changelog with the following structure:

## Summary
[2-3 sentence overview of what changed overall]

## Key Changes
- [Bullet point highlighting most important change]
- [Another important change]
- [3-5 key changes total]

## Changes by Commit

For each commit in the diff, create an entry like:

### [`short-hash`](https://github.com/jamiew/clactions/commit/FULL_HASH) - Commit Subject
*Author Name, Commit Date*

**Summary:** [1-2 sentence description of what this commit does]

**Changes:**
- [Specific change 1 - be concrete about files and functionality]
- [Specific change 2]
- [etc]

<details><summary>Full commit message</summary>

```
[Include the full commit message if it has useful detail beyond the subject]
```
</details>

---

Be specific about:
- Which workflow files were modified
- What functionality changed (new jobs, changed schedules, different permissions, etc.)
- Why the change matters (if obvious from commit message or diff)
- Breaking changes or important behavioral changes

Focus on being informative for a downstream system that might be affected by these changes.
Do not include the raw diffs in the changelog - only your analysis.

Here are the commit diffs:

{diff_content}
"""
    return prompt

def analyze_unified(diff_content, commits_content):
    """Analyze changes holistically"""
    prompt = f"""Analyze the unified diff which shows all workflow changes from the last 8 hours.

Create a comprehensive changelog with this structure:

## 🔄 Workflow Changelog

### Summary
[2-4 sentences describing the overall theme of changes - e.g., "Major refactoring of data workflows", "New features added for X", "Bug fixes and performance improvements", etc.]

### Highlights
- ✨ [Most important new feature or change]
- 🔧 [Important fix or improvement]
- 🏗️ [Architectural or structural change]
- [2-5 highlights total, use emojis to categorize: ✨ feature, 🔧 fix, 🏗️ refactor, 📝 docs, ⚡ perf, 🔒 security]

### What Changed

#### New Workflows
- **workflow-name.yml** - [What it does and why it was added]
[Only include if new workflows were added]

#### Modified Workflows
For each modified workflow file:

**`workflow-name.yml`**
- [Specific change with impact - e.g., "Changed schedule from hourly to every 8 hours to reduce API usage"]
- [Another specific change]
- [Be concrete about what changed and why it matters]

#### Removed Workflows
- **old-workflow.yml** - [What it did and why it was removed]
[Only include if workflows were removed]

### Impact Assessment
[1-2 paragraphs describing potential impacts on downstream systems, APIs, documentation, or dependencies]

### Technical Details
<details><summary>View commit list</summary>

{commits_content}

</details>

---

Guidelines:
- Look at the unified diff to understand the net effect of all changes
- Focus on functional changes, not just file renames (but do mention significant renames)
- Identify patterns across multiple changes (e.g., "All data workflows now use commit-fetch-rebase-push pattern")
- Call out breaking changes or important behavioral changes
- Be specific about schedule changes, permission changes, new dependencies, etc.
- Group related changes together
- Write for an audience that needs to understand downstream impacts

Do NOT include raw diffs in the main changelog body.

Here is the unified diff:

{diff_content}
"""
    return prompt

def main():
    if len(sys.argv) < 4:
        print("Usage: analyze-workflow-changes.py <mode> <diff-file> <output-file> [commits-file]")
        sys.exit(1)

    mode = sys.argv[1]
    diff_file = sys.argv[2]
    output_file = sys.argv[3]
    commits_file = sys.argv[4] if len(sys.argv) > 4 else None

    # Read diff content
    with open(diff_file, 'r') as f:
        diff_content = f.read()

    # Read commits if provided
    commits_content = ""
    if commits_file:
        with open(commits_file, 'r') as f:
            commits_content = f.read()

    # Generate prompt based on mode
    if mode == 'by-commit':
        prompt = analyze_by_commit(diff_content)
    elif mode == 'unified':
        prompt = analyze_unified(diff_content, commits_content)
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)

    # Call Claude API
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        changelog = message.content[0].text

        # Write output
        with open(output_file, 'w') as f:
            f.write(changelog)

        print(f"✓ Changelog written to {output_file}")

    except Exception as e:
        print(f"ERROR calling Claude API: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
