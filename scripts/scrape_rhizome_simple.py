#!/usr/bin/env python3
"""
Simple Rhizome.org community scraper using only standard library.
"""

import json
import sys
import urllib.request
import urllib.error
from datetime import datetime
import re
from html.parser import HTMLParser


class RhizomeParser(HTMLParser):
    """Simple HTML parser to extract listing information."""

    def __init__(self):
        super().__init__()
        self.listings = []
        self.current_listing = {}
        self.in_title = False
        self.in_description = False
        self.in_link = False
        self.current_tag_stack = []

    def handle_starttag(self, tag, attrs):
        self.current_tag_stack.append(tag)
        attrs_dict = dict(attrs)

        # Look for links
        if tag == 'a' and 'href' in attrs_dict:
            href = attrs_dict['href']
            if href and not href.startswith('#') and not href.startswith('javascript:'):
                self.current_listing['url'] = href if href.startswith('http') else f'https://rhizome.org{href}'
                self.in_link = True

        # Look for headings (potential titles)
        if tag in ['h1', 'h2', 'h3', 'h4']:
            self.in_title = True

        # Look for article or list item containers
        if tag in ['article', 'li']:
            if self.current_listing and self.current_listing.get('title'):
                self.listings.append(self.current_listing)
            self.current_listing = {}

    def handle_endtag(self, tag):
        if self.current_tag_stack and self.current_tag_stack[-1] == tag:
            self.current_tag_stack.pop()

        if tag == 'a':
            self.in_link = False
        if tag in ['h1', 'h2', 'h3', 'h4']:
            self.in_title = False

    def handle_data(self, data):
        data = data.strip()
        if not data:
            return

        if self.in_title and self.in_link:
            self.current_listing['title'] = data
        elif self.in_link and not self.current_listing.get('title'):
            # Sometimes the link text is the title
            self.current_listing['title'] = data

    def get_listings(self):
        # Add the last listing if exists
        if self.current_listing and self.current_listing.get('title'):
            self.listings.append(self.current_listing)

        # Fill in missing fields
        for listing in self.listings:
            if 'description' not in listing:
                listing['description'] = ''
            if 'type' not in listing:
                listing['type'] = 'community-listing'
            if 'date' not in listing:
                listing['date'] = datetime.now().isoformat()
            if 'url' not in listing:
                listing['url'] = 'https://rhizome.org/community/'

        return self.listings[:15]  # Limit to 15 items


def fetch_page():
    """Fetch the Rhizome community page."""
    url = 'https://rhizome.org/community/'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    req = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read().decode('utf-8')
            return content
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        return None
    except urllib.error.URLError as e:
        print(f"URL Error: {e.reason}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None


def main():
    import sys

    print("Fetching Rhizome community page...", file=sys.stderr)

    html_content = fetch_page()

    if not html_content:
        result = {
            "community_listings": [
                {
                    "title": "Rhizome Community Access Error",
                    "description": "Unable to fetch community listings. Connection failed or access denied.",
                    "url": "https://rhizome.org/community/",
                    "type": "system-message",
                    "date": datetime.now().isoformat()
                }
            ],
            "last_updated": datetime.now().isoformat(),
            "status": "error",
            "error": "Failed to fetch page"
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    # Check for Cloudflare challenge
    if 'Just a moment' in html_content or 'Enable JavaScript and cookies' in html_content:
        result = {
            "community_listings": [
                {
                    "title": "Rhizome Community - Cloudflare Protected",
                    "description": "The Rhizome community page requires JavaScript execution to bypass Cloudflare protection.",
                    "url": "https://rhizome.org/community/",
                    "type": "system-message",
                    "date": datetime.now().isoformat()
                }
            ],
            "last_updated": datetime.now().isoformat(),
            "status": "cloudflare-protected",
            "error": "Cloudflare JavaScript challenge required"
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    print(f"Successfully fetched {len(html_content)} bytes", file=sys.stderr)
    print("Parsing community listings...", file=sys.stderr)

    # Parse the HTML
    parser = RhizomeParser()
    try:
        parser.feed(html_content)
        listings = parser.get_listings()
    except Exception as e:
        print(f"Parse error: {e}", file=sys.stderr)
        listings = []

    if not listings:
        print("Warning: No listings found", file=sys.stderr)

    result = {
        "community_listings": listings if listings else [
            {
                "title": "No listings found",
                "description": "The page structure may not be compatible with the parser.",
                "url": "https://rhizome.org/community/",
                "type": "system-message",
                "date": datetime.now().isoformat()
            }
        ],
        "last_updated": datetime.now().isoformat(),
        "status": "success" if listings else "no-listings-found"
    }

    print(json.dumps(result, indent=2))
    print(f"Found {len(listings)} community listings", file=sys.stderr)


if __name__ == '__main__':
    main()
