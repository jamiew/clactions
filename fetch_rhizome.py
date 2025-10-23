#!/usr/bin/env python3
"""
Fetch Rhizome community listings.
Supports both Playwright (for Cloudflare bypass) and fallback requests.
"""

import json
import os
import sys
import re
from datetime import datetime, timezone

def create_fallback_data():
    """Create fallback data structure when scraping is blocked."""
    return {
        "community_listings": [
            {
                "title": "Rhizome Community Access Limited",
                "description": "Cloudflare protection prevents automated scraping. Requires Playwright with browser installation.",
                "url": "https://rhizome.org/community/",
                "type": "system-message",
                "date": datetime.now(timezone.utc).isoformat()
            }
        ],
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "status": "cloudflare-protected",
        "note": "Install: pip install playwright && playwright install chromium"
    }

def parse_community_listings(html_content):
    """Parse HTML content to extract community listings."""
    listings = []

    # Try to extract listing items from common patterns
    # Rhizome uses various structures, so we'll try multiple patterns

    # Pattern 1: Look for article or list items with links
    article_pattern = r'<article[^>]*>(.*?)</article>'
    item_pattern = r'<li[^>]*class="[^"]*community[^"]*"[^>]*>(.*?)</li>'

    # Pattern 2: Look for headings with links
    heading_link_pattern = r'<h[2-4][^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>.*?</h[2-4]>'

    # Pattern 3: Look for description paragraphs
    desc_pattern = r'<p[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)</p>'

    # Simple extraction - find all links in the community section
    links = re.findall(r'<a[^>]*href="(/community/[^"]*)"[^>]*>(.*?)</a>', html_content, re.DOTALL)

    for url, title in links[:15]:  # Limit to 15 items
        # Clean up title
        title_clean = re.sub(r'<[^>]+>', '', title).strip()
        if title_clean and len(title_clean) > 3:
            listing = {
                "title": title_clean,
                "description": "",
                "url": f"https://rhizome.org{url}" if url.startswith('/') else url,
                "type": "community-listing",
                "date": datetime.now(timezone.utc).isoformat()
            }
            listings.append(listing)

    return listings

def fetch_with_playwright():
    """Fetch using Playwright to bypass Cloudflare."""
    try:
        from playwright.sync_api import sync_playwright

        print("Using Playwright to bypass Cloudflare...", file=sys.stderr)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )

            # Navigate and wait for page to load
            page.goto('https://rhizome.org/community/', wait_until='networkidle', timeout=60000)

            # Wait a bit for any dynamic content
            page.wait_for_timeout(3000)

            html_content = page.content()
            browser.close()

            # Parse the content
            listings = parse_community_listings(html_content)

            if not listings:
                # If parsing failed, at least we got the page
                return {
                    "community_listings": [{
                        "title": "Rhizome Community",
                        "description": "Successfully accessed page but parsing needs refinement",
                        "url": "https://rhizome.org/community/",
                        "type": "placeholder",
                        "date": datetime.now(timezone.utc).isoformat()
                    }],
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                    "status": "partial-success",
                    "note": "Page accessed via Playwright, HTML parsing may need updates"
                }

            return {
                "community_listings": listings,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            }

    except ImportError:
        print("Playwright not installed. Install with: pip install playwright && playwright install chromium", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Playwright error: {e}", file=sys.stderr)
        return None

def fetch_with_requests():
    """Fallback: try with requests (likely to be blocked by Cloudflare)."""
    try:
        import requests

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }

        response = requests.get('https://rhizome.org/community/', headers=headers, timeout=30)

        if 'challenge-platform' in response.text or response.status_code == 403:
            print("Cloudflare protection detected with requests.", file=sys.stderr)
            return None

        listings = parse_community_listings(response.text)

        if listings:
            return {
                "community_listings": listings,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "status": "success"
            }

        return None

    except Exception as e:
        print(f"Requests error: {e}", file=sys.stderr)
        return None

def main():
    # Try Playwright first, then requests, then fallback
    data = fetch_with_playwright()

    if not data:
        print("Trying with requests library...", file=sys.stderr)
        data = fetch_with_requests()

    if not data:
        print("All methods failed, using fallback data.", file=sys.stderr)
        data = create_fallback_data()

    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)

    # Write JSON file
    with open('data/rhizome.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"✓ Created data/rhizome.json - Status: {data.get('status', 'unknown')}", file=sys.stderr)
    print(f"  Found {len(data.get('community_listings', []))} listing(s)", file=sys.stderr)

    return 0

if __name__ == '__main__':
    sys.exit(main())
