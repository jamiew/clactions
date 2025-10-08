# TODO

Ideas and tasks for the Claude GitHub Actions Automaton.

## High Priority

- [ ] Add ANTHROPIC_API_KEY secret to repository
- [ ] Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
- [ ] Create initial data.json file
- [x] Add GLIF_API_TOKEN secret for Glif integration
- [x] Add GLIF_WORKFLOW_ID secret (weather workflow)

## Features to Build

- [ ] Add MCP server integration workflow (use MCP to access external data)
- [ ] Create cross-repo PR workflow (submit PRs to other repositories)
- [ ] Add Reddit scraper (top posts from r/programming or similar)
- [ ] Add Hacker News scraper (front page stories)
- [ ] Weather data integration (display current conditions)
- [ ] Add image generation via Glif workflow output
- [ ] Create analytics workflow (track visitor patterns, popular content)
- [ ] Blog post generator (Claude writes about its own improvements)
- [ ] Dark mode toggle for website
- [ ] RSS feed generation from data.json
- [ ] Slack/Discord notifications for workflow failures (in addition to self-repair)

## Improvements

- [ ] Better error handling in scrapers (retry logic, fallbacks)
- [ ] Rate limit detection and backoff
- [ ] Metrics dashboard (workflow success rates, data freshness)
- [ ] Performance optimization for page load times
- [ ] Add tests for workflow YAML validation
- [ ] Improve mobile responsive design
- [ ] Add accessibility features (ARIA labels, keyboard nav)

## Documentation

- [ ] Create architecture diagram (visual representation of the loop)
- [ ] Add examples of data.json structure
- [ ] Write contributor guide
- [ ] Document API rate limits and schedules
- [ ] Create troubleshooting guide with common errors

## Infrastructure

- [ ] Optimize workflow schedules based on activity patterns
- [ ] Add workflow concurrency limits
- [ ] Set up status badge in README
- [ ] Configure branch protection rules
- [ ] Add dependabot for action version updates

## Content Ideas

- [ ] Fetch cryptocurrency prices
- [ ] GitHub trending repositories
- [ ] Quotes of the day
- [ ] Fun facts or TIL content
- [ ] Astronomy picture of the day (NASA API)
- [ ] Tech conference schedules

## Experiments

- [ ] Can we make the website interactive? (client-side JS from static data)
- [ ] Version history of data.json (track changes over time)
- [ ] A/B testing different UI designs via Claude
- [ ] Self-learning: Claude analyzes what content gets most engagement
- [ ] Meta: Claude writing its own TODO items based on failures/patterns

---

## How This Works

The `todo-worker.yml` workflow reads this file regularly and picks items to work on.
Add new ideas anytime. Mark completed items with [x].
Claude will prioritize based on dependencies and feasibility.
