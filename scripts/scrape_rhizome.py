#!/usr/bin/env python3
"""
Scrape Rhizome.org community listings.
This script attempts to fetch the Rhizome community page with various techniques.
"""

import json
import sys
from datetime import datetime
import time

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: Required packages not installed. Run: pip install requests beautifulsoup4", file=sys.stderr)
    sys.exit(1)


def fetch_with_session():
    """Try to fetch the page using a session with browser-like headers."""
    session = requests.Session()

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
    }

    url = 'https://rhizome.org/community/'

    try:
        # First request might get challenge
        response = session.get(url, headers=headers, timeout=30)

        # If we get a challenge, wait and retry
        if 'Just a moment' in response.text or response.status_code == 403:
            print(f"Cloudflare challenge detected (status {response.status_code})", file=sys.stderr)
            time.sleep(5)
            response = session.get(url, headers=headers, timeout=30)

        response.raise_for_status()
        return response.text

    except requests.RequestException as e:
        print(f"Error fetching page: {e}", file=sys.stderr)
        return None


def parse_community_listings(html_content):
    """Parse the HTML content to extract community listings."""
    soup = BeautifulSoup(html_content, 'html.parser')

    listings = []

    # Try various selectors that might contain community listings
    # These are common patterns for listing pages

    # Look for article elements, list items, or divs with specific classes
    potential_containers = []

    # Try common listing patterns
    potential_containers.extend(soup.find_all('article'))
    potential_containers.extend(soup.find_all('div', class_=lambda x: x and ('listing' in x.lower() or 'item' in x.lower() or 'post' in x.lower())))
    potential_containers.extend(soup.find_all('li', class_=lambda x: x and ('listing' in x.lower() or 'item' in x.lower())))

    # If we find specific listing elements
    for item in potential_containers[:15]:  # Limit to 15 items
        listing = {}

        # Try to find title
        title_elem = item.find(['h1', 'h2', 'h3', 'h4', 'a'])
        if title_elem:
            listing['title'] = title_elem.get_text(strip=True)

        # Try to find link
        link_elem = item.find('a', href=True)
        if link_elem:
            href = link_elem['href']
            if href.startswith('/'):
                href = f"https://rhizome.org{href}"
            listing['url'] = href

        # Try to find description
        desc_elem = item.find(['p', 'div', 'span'], class_=lambda x: x and ('desc' in x.lower() or 'summary' in x.lower() or 'excerpt' in x.lower()))
        if desc_elem:
            listing['description'] = desc_elem.get_text(strip=True)[:200]

        # Try to find date
        date_elem = item.find(['time', 'span'], class_=lambda x: x and 'date' in x.lower())
        if date_elem:
            listing['date'] = date_elem.get_text(strip=True)
            if date_elem.has_attr('datetime'):
                listing['date'] = date_elem['datetime']

        # Only add if we have at least a title
        if listing.get('title'):
            # Fill in missing fields with defaults
            if 'url' not in listing:
                listing['url'] = 'https://rhizome.org/community/'
            if 'description' not in listing:
                listing['description'] = ''
            if 'type' not in listing:
                listing['type'] = 'community-listing'
            if 'date' not in listing:
                listing['date'] = datetime.now().isoformat()

            listings.append(listing)

    return listings


def main():
    """Main function to scrape Rhizome community page."""
    print("Fetching Rhizome community page...", file=sys.stderr)

    html_content = fetch_with_session()

    if not html_content:
        # Create error response
        result = {
            "community_listings": [
                {
                    "title": "Rhizome Community Access Protected",
                    "description": "Unable to fetch community listings due to Cloudflare protection. The page requires JavaScript execution.",
                    "url": "https://rhizome.org/community/",
                    "type": "system-message",
                    "date": datetime.now().isoformat()
                }
            ],
            "last_updated": datetime.now().isoformat(),
            "status": "cloudflare-protected",
            "error": "HTTP 403 Forbidden - Cloudflare JavaScript challenge required"
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    # Check if we got the real page or Cloudflare challenge
    if 'Just a moment' in html_content or 'Enable JavaScript and cookies to continue' in html_content:
        result = {
            "community_listings": [
                {
                    "title": "Rhizome Community - Cloudflare Protected",
                    "description": "The Rhizome community page is protected by Cloudflare bot detection. Browser automation required.",
                    "url": "https://rhizome.org/community/",
                    "type": "system-message",
                    "date": datetime.now().isoformat()
                }
            ],
            "last_updated": datetime.now().isoformat(),
            "status": "cloudflare-protected",
            "error": "Cloudflare JavaScript challenge page received"
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    print(f"Successfully fetched {len(html_content)} bytes", file=sys.stderr)
    print("Parsing community listings...", file=sys.stderr)

    listings = parse_community_listings(html_content)

    if not listings:
        print("Warning: No listings found. Page structure may have changed.", file=sys.stderr)
        # Output page structure for debugging
        soup = BeautifulSoup(html_content, 'html.parser')
        print(f"Page title: {soup.title.string if soup.title else 'No title'}", file=sys.stderr)

    result = {
        "community_listings": listings if listings else [
            {
                "title": "No listings found",
                "description": "The page structure may have changed or is not yet supported.",
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
