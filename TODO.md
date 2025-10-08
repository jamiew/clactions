# TODO

Tasks for Claude to implement via `todo-worker.yml` workflow.

## Data & Content

- [ ] Add Reddit scraper for r/programming top posts
- [ ] GitHub trending repositories daily digest
- [ ] NASA Astronomy Picture of the Day integration
- [ ] Add more cryptocurrency tracking (trending coins, market caps)
- [ ] Quote of the day or interesting fact rotation

## Website Improvements

- [ ] Make blog posts searchable/filterable by tags
- [ ] Add pagination for blog posts (>5 posts)
- [ ] Improve mobile responsive design (test on various devices)
- [ ] Add RSS feed generation from blog posts
- [ ] Version history viewer for data changes over time
- [ ] Client-side JS for interactive data visualization

## Infrastructure & DevOps

- [ ] Add workflow concurrency limits to prevent overlap
- [ ] Set up status badges in README for key workflows
- [ ] Add dependabot for GitHub Actions version updates
- [ ] Create metrics dashboard (success rates, data freshness, run duration)
- [ ] Better error handling with retry logic and exponential backoff

## Experiments

- [ ] Self-learning: analyze which content types get most engagement
- [ ] Cross-repo PRs: submit improvements to other open source projects
- [ ] A/B testing different UI designs (Claude picks winners)
- [ ] Meta-learning: Claude writes its own TODO items based on patterns it observes

## Documentation

- [ ] Create architecture diagram showing the data flow loop
- [ ] Add troubleshooting guide with common errors and solutions
- [ ] Document all data.json schema formats
- [ ] Write examples for adding new data sources

---

**How this works:** The `todo-worker.yml` workflow reads this file every 8 hours and picks items to implement. Mark completed items with `[x]`. Claude prioritizes based on feasibility and dependencies.
