#!/usr/bin/env node

/**
 * Fetch Rhizome Community Listings
 *
 * This script uses Playwright to bypass Cloudflare protection and scrape
 * community listings from rhizome.org/community/
 *
 * Requirements: npm install playwright && npx playwright install chromium
 *
 * Usage: node scripts/fetch-rhizome.js
 */

const fs = require('fs');
const path = require('path');

async function fetchRhizomeListings() {
  let browser;

  try {
    // Check if playwright is installed
    let playwright;
    try {
      playwright = require('playwright');
    } catch (err) {
      console.error('Playwright not installed. Run: npm install playwright && npx playwright install chromium');
      process.exit(1);
    }

    // Launch browser
    browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    console.log('Fetching https://rhizome.org/community/ ...');
    await page.goto('https://rhizome.org/community/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for Cloudflare challenge to complete
    await page.waitForTimeout(5000);

    // Extract listings
    const listings = await page.evaluate(() => {
      const items = [];

      // Adjust selectors based on actual Rhizome page structure
      const listingSelectors = [
        '.listing-item',
        '.community-listing',
        '.opportunity-item',
        'article.post',
        '.event-item'
      ];

      let elements = [];
      for (const selector of listingSelectors) {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
          elements = Array.from(found);
          break;
        }
      }

      // Fallback: look for any article or list items in main content
      if (elements.length === 0) {
        elements = Array.from(document.querySelectorAll('main article, main li, .content article'));
      }

      elements.slice(0, 15).forEach(element => {
        const titleEl = element.querySelector('h1, h2, h3, h4, .title, .listing-title');
        const descEl = element.querySelector('p, .description, .excerpt, .summary');
        const linkEl = element.querySelector('a');
        const dateEl = element.querySelector('time, .date, .published');

        if (titleEl && titleEl.textContent.trim()) {
          const listing = {
            title: titleEl.textContent.trim(),
            description: descEl ? descEl.textContent.trim().substring(0, 200) : '',
            url: linkEl ? new URL(linkEl.href, 'https://rhizome.org').href : 'https://rhizome.org/community/',
            type: element.className || 'listing',
            date: dateEl ? dateEl.getAttribute('datetime') || dateEl.textContent : new Date().toISOString(),
            source: 'Rhizome Community'
          };
          items.push(listing);
        }
      });

      return items;
    });

    // Create data structure
    const data = {
      community_listings: listings,
      last_updated: new Date().toISOString(),
      status: listings.length > 0 ? 'success' : 'no_listings_found',
      url: 'https://rhizome.org/community/',
      note: `Fetched ${listings.length} listings using browser automation`
    };

    // Write to file
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'rhizome.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`✓ Successfully fetched ${listings.length} listings`);
    console.log(`✓ Saved to ${outputPath}`);

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('Error fetching Rhizome listings:', error.message);

    // Write error state
    const errorData = {
      community_listings: [],
      last_updated: new Date().toISOString(),
      status: 'error',
      error: error.message,
      url: 'https://rhizome.org/community/',
      note: 'Failed to fetch listings - see error field'
    };

    const outputPath = path.join(__dirname, '..', 'data', 'rhizome.json');
    fs.writeFileSync(outputPath, JSON.stringify(errorData, null, 2));

    if (browser) await browser.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fetchRhizomeListings();
}

module.exports = { fetchRhizomeListings };
