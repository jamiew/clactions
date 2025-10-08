# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project demonstrates Claude Code + GitHub Actions integration for automated website updates. The system uses:
- GitHub Actions as cron jobs to check external sources
- Automated updates to a website based on those checks
- Cross-repository PR creation capabilities
- MCP server integration for external data access

## Key Use Cases

1. **Automated Website Updates**: GitHub Actions check external sources and automatically update the website content
2. **Code-to-Website Sync**: Code changes automatically trigger corresponding website updates
3. **Cross-Repository PRs**: Submit PRs to external repositories from this codebase
4. **MCP Integration**: GitHub Actions that utilize MCP servers for external data connectivity
