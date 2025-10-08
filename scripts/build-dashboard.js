#!/usr/bin/env node

const fs = require('fs');

// Read files with fallbacks for missing files
const nytimes = fs.existsSync('data/nytimes.json')
  ? JSON.parse(fs.readFileSync('data/nytimes.json', 'utf-8'))
  : { headlines: [], last_updated: 'Never' };

const glif = fs.existsSync('data/glif.json')
  ? JSON.parse(fs.readFileSync('data/glif.json', 'utf-8'))
  : { featured_workflows: [], featured_agents: [], last_updated: 'Never' };

const weather = fs.existsSync('data/weather.json')
  ? JSON.parse(fs.readFileSync('data/weather.json', 'utf-8'))
  : fs.existsSync('weather.json')
    ? JSON.parse(fs.readFileSync('weather.json', 'utf-8'))
    : { temperature: 70, condition: 'Clear', humidity: '—', feels_like: '—', last_updated: 'Never' };

const crypto = fs.existsSync('data/crypto-prices.json')
  ? JSON.parse(fs.readFileSync('data/crypto-prices.json', 'utf-8'))
  : { coins: {}, last_updated: 'Never' };

// Legacy data.json support (will be removed later)
const legacyData = fs.existsSync('data.json')
  ? JSON.parse(fs.readFileSync('data.json', 'utf-8'))
  : {};

const nycTheme = fs.existsSync('theme-nyc.css')
  ? fs.readFileSync('theme-nyc.css', 'utf-8')
  : '/* No NYC theme yet */';

// Generate weather-adaptive theme based on current conditions
function generateWeatherTheme(weather) {
  const temp = parseInt(weather.temperature) || 70;
  const condition = (weather.condition || 'Clear').toLowerCase();

  let bgPrimary, bgSecondary, textPrimary, accent, accentSecondary;
  let animations = '';
  let backgroundEffect = '';

  // Temperature-based color shifts
  if (temp < 32) {
    // Freezing - icy blues and whites
    bgPrimary = '#e8f4f8';
    bgSecondary = '#d0e8f2';
    textPrimary = '#1a2942';
    accent = '#4a90e2';
    accentSecondary = '#7bb3ff';
  } else if (temp < 50) {
    // Cold - cool blues and grays
    bgPrimary = '#f0f4f8';
    bgSecondary = '#dce4ec';
    textPrimary = '#2c3e50';
    accent = '#5680c1';
    accentSecondary = '#8badd6';
  } else if (temp < 70) {
    // Mild - soft neutrals
    bgPrimary = '#f8f9fa';
    bgSecondary = '#e9ecef';
    textPrimary = '#212529';
    accent = '#6c757d';
    accentSecondary = '#adb5bd';
  } else if (temp < 85) {
    // Warm - golden tones
    bgPrimary = '#fff9f0';
    bgSecondary = '#ffe8cc';
    textPrimary = '#3d2817';
    accent = '#ff9500';
    accentSecondary = '#ffb340';
  } else {
    // Hot - vibrant oranges and reds
    bgPrimary = '#fff3e6';
    bgSecondary = '#ffe0b3';
    textPrimary = '#4a1e00';
    accent = '#ff6b35';
    accentSecondary = '#ff8c5a';
  }

  // Condition-based effects and overrides
  if (condition.includes('rain') || condition.includes('drizzle')) {
    bgPrimary = '#d4e4f7';
    bgSecondary = '#b8d4f1';
    accent = '#4a7ba7';
    accentSecondary = '#6b96c1';

    animations = `
      @keyframes rain {
        0% { transform: translateY(-100vh) translateX(0); opacity: 0.6; }
        100% { transform: translateY(100vh) translateX(10px); opacity: 0; }
      }

      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(transparent 90%, rgba(74, 123, 167, 0.1) 100%);
        background-size: 2px 50px;
        animation: rain 0.5s linear infinite;
        pointer-events: none;
        z-index: 1;
      }

      body::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(74, 123, 167, 0.03) 2px,
          rgba(74, 123, 167, 0.03) 4px
        );
        animation: rain 0.7s linear infinite;
        pointer-events: none;
        z-index: 1;
      }

      .container { position: relative; z-index: 2; }
    `;
  } else if (condition.includes('snow')) {
    bgPrimary = '#f0f8ff';
    bgSecondary = '#e3f2fd';
    accent = '#64b5f6';
    accentSecondary = '#90caf9';

    animations = `
      @keyframes snowfall {
        0% { transform: translateY(-10px) translateX(0); opacity: 1; }
        100% { transform: translateY(100vh) translateX(50px); opacity: 0; }
      }

      body::before {
        content: '❄️ ❅ ❆ ❄️ ❅ ❆ ❄️ ❅ ❆ ❄️ ❅ ❆';
        position: fixed;
        top: -50px;
        left: 0;
        width: 100%;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.8);
        animation: snowfall 10s linear infinite;
        pointer-events: none;
        z-index: 1;
        letter-spacing: 80px;
      }

      .container { position: relative; z-index: 2; }
    `;
  } else if (condition.includes('cloud')) {
    bgPrimary = '#f5f7fa';
    bgSecondary = '#e4e9f0';
    accent = '#778899';
    accentSecondary = '#a0aec0';

    backgroundEffect = `
      body {
        background: linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 100%);
      }
    `;
  } else if (condition.includes('clear') || condition.includes('sunny')) {
    // Extra bright and vibrant
    const hour = new Date().getHours();
    if (hour >= 17 || hour <= 6) {
      // Sunset/night - warm purples and oranges
      bgPrimary = '#ffe4e1';
      bgSecondary = '#ffd4cc';
      accent = '#ff6b9d';
      accentSecondary = '#ffa07a';
    } else {
      // Bright day
      bgPrimary = '#fffef7';
      bgSecondary = '#fff8dc';
      accent = '#ffa500';
      accentSecondary = '#ffb347';
    }

    backgroundEffect = `
      body {
        background: radial-gradient(circle at top right, ${accentSecondary}15, ${bgPrimary} 70%);
      }
    `;
  } else if (condition.includes('fog') || condition.includes('mist')) {
    bgPrimary = '#e8e8e8';
    bgSecondary = '#d3d3d3';
    accent = '#708090';
    accentSecondary = '#a9a9a9';

    animations = `
      @keyframes fog {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }

      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom,
          rgba(255,255,255,0.1) 0%,
          rgba(200,200,200,0.3) 50%,
          rgba(255,255,255,0.1) 100%
        );
        animation: fog 8s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      }

      .container { position: relative; z-index: 2; }
    `;
  }

  return `
    /* Weather-adaptive theme generated from current conditions */
    /* Condition: ${weather.condition}, Temperature: ${weather.temperature}°F */
    :root {
      --bg-primary: ${bgPrimary};
      --bg-secondary: ${bgSecondary};
      --text-primary: ${textPrimary};
      --text-secondary: ${textPrimary}99;
      --accent: ${accent};
      --accent-secondary: ${accentSecondary};
      --border-color: ${textPrimary}15;
    }

    ${backgroundEffect}
    ${animations}

    .card {
      backdrop-filter: blur(10px);
      background: ${bgSecondary}ee;
    }
  `;
}

const weatherAdaptiveTheme = generateWeatherTheme(weather);

const workflows = fs.existsSync('workflow_runs.json')
  ? JSON.parse(fs.readFileSync('workflow_runs.json', 'utf-8'))
  : [];

// Read blog posts
const blogPosts = [];
if (fs.existsSync('blog')) {
  const blogFiles = fs.readdirSync('blog').filter(f => f.endsWith('.md'));
  blogFiles.forEach(file => {
    try {
      const content = fs.readFileSync(`blog/${file}`, 'utf-8');
      const lines = content.split('\n');

      // Extract title from front matter or first heading
      let title = file.replace('.md', '').replace(/-/g, ' ');
      let date = '';

      // Try to parse YAML front matter
      if (lines[0] === '---') {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i] === '---') break;
          if (lines[i].startsWith('title:')) {
            title = lines[i].replace('title:', '').trim().replace(/['"]/g, '');
          }
          if (lines[i].startsWith('date:')) {
            date = lines[i].replace('date:', '').trim();
          }
        }
      }

      // Fallback: get first heading
      if (!date || title === file.replace('.md', '').replace(/-/g, ' ')) {
        const heading = lines.find(l => l.startsWith('# '));
        if (heading) title = heading.replace('# ', '').trim();
      }

      blogPosts.push({
        file,
        title,
        date: date || new Date(fs.statSync(`blog/${file}`).mtime).toISOString().split('T')[0]
      });
    } catch (e) {
      console.error(`Error reading blog post ${file}:`, e.message);
    }
  });

  // Sort by date descending
  blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Build weather card
const weatherCard = `
  <div class="card">
    <h2><span class="card-icon">🌤️</span> Weather</h2>
    <div class="weather-big">${weather.temperature || '—'}°F</div>
    <ul class="data-list">
      <li class="data-item">
        <span class="data-label">Location</span>
        <span class="data-value">${weather.location || 'New York, NY'}</span>
      </li>
      <li class="data-item">
        <span class="data-label">Condition</span>
        <span class="data-value">${weather.condition || 'Unknown'}</span>
      </li>
      <li class="data-item">
        <span class="data-label">Feels Like</span>
        <span class="data-value">${weather.feels_like || '—'}°F</span>
      </li>
      <li class="data-item">
        <span class="data-label">Humidity</span>
        <span class="data-value">${weather.humidity || '—'}%</span>
      </li>
    </ul>
    <div class="timestamp">Updated: ${weather.last_updated || 'Never'}</div>
  </div>
`;

// Build NY Times card
const headlines = nytimes.headlines || legacyData.nytimes_headlines || [];
const headlinesHtml = headlines.length > 0
  ? headlines.slice(0, 10).map(h => {
      // Handle both old format (string) and new format (object with title/url)
      if (typeof h === 'string') {
        return `
          <li class="data-item">
            <span class="data-value">${h}</span>
          </li>`;
      } else {
        return `
          <li class="data-item">
            <a href="${h.url}" target="_blank" class="headline-link">
              <span class="data-value">${h.title}</span>
            </a>
          </li>`;
      }
    }).join('')
  : '<li class="data-item"><span class="data-value">No headlines yet</span></li>';

const nytCard = `
  <div class="card">
    <h2>
      <span class="card-icon">📰</span>
      <a href="https://github.com/jamiew/claude-gha-demo/blob/main/.github/workflows/fetch-nytimes.yml" target="_blank" class="card-title-link">NY Times</a>
    </h2>
    <ul class="data-list">
      ${headlinesHtml}
    </ul>
    <div class="timestamp">
      Updated: ${nytimes.last_updated || legacyData.last_updated || 'Never'} ·
      <a href="https://github.com/jamiew/claude-gha-demo/actions/workflows/fetch-nytimes.yml" target="_blank" class="workflow-link">View runs →</a>
    </div>
  </div>
`;

// Build Glif Workflows card
const glifWorkflows = glif.featured_workflows || legacyData.glif?.featured_workflows || [];
const glifWorkflowsHtml = glifWorkflows.length > 0
  ? glifWorkflows.slice(0, 5).map(w => `
      <li class="data-item">
        <a href="${w.url}" target="_blank" class="headline-link">
          <span class="data-label">${w.name}</span>
          <span class="data-value" style="font-size:0.85rem;opacity:0.7;display:block;margin-top:2px;">${w.description?.substring(0, 80) || 'No description'}${w.description?.length > 80 ? '...' : ''}</span>
          <span class="data-meta" style="font-size:0.75rem;opacity:0.5;display:block;margin-top:2px;">by @${w.creator}</span>
        </a>
      </li>
    `).join('')
  : '<li class="data-item"><span class="data-value">No Glif workflows yet</span></li>';

const glifWorkflowsCard = `
  <div class="card">
    <h2>
      <span class="card-icon">🎨</span>
      <a href="https://github.com/jamiew/claude-gha-demo/blob/main/.github/workflows/fetch-glif.yml" target="_blank" class="card-title-link">Glif Workflows</a>
    </h2>
    <ul class="data-list">
      ${glifWorkflowsHtml}
    </ul>
    <div class="timestamp">
      Updated: ${glif.last_updated || legacyData.glif?.last_updated || 'Never'} ·
      <a href="https://github.com/jamiew/claude-gha-demo/actions/workflows/fetch-glif.yml" target="_blank" class="workflow-link">View runs →</a>
    </div>
  </div>
`;

// Build Glif Agents card
const glifAgents = glif.featured_agents || legacyData.glif?.featured_agents || [];
const glifAgentsHtml = glifAgents.length > 0
  ? glifAgents.slice(0, 3).map(a => `
      <li class="data-item">
        <a href="${a.url}" target="_blank" class="headline-link">
          <span class="data-label">${a.name}</span>
          <span class="data-value" style="font-size:0.85rem;opacity:0.7;display:block;margin-top:2px;">${a.description?.substring(0, 80) || 'No description'}${a.description?.length > 80 ? '...' : ''}</span>
          <span class="data-meta" style="font-size:0.75rem;opacity:0.5;display:block;margin-top:2px;">by @${a.creator}</span>
        </a>
      </li>
    `).join('')
  : '<li class="data-item"><span class="data-value">No Glif agents yet</span></li>';

const glifAgentsCard = `
  <div class="card">
    <h2>
      <span class="card-icon">🤖</span>
      <a href="https://glif.app/bots" target="_blank" class="card-title-link">Glif Agents</a>
    </h2>
    <ul class="data-list">
      ${glifAgentsHtml}
    </ul>
    <div class="timestamp">
      Updated: ${glif.last_updated || legacyData.glif?.last_updated || 'Never'} ·
      <a href="https://github.com/jamiew/claude-gha-demo/actions/workflows/fetch-glif.yml" target="_blank" class="workflow-link">View runs →</a>
    </div>
  </div>
`;

// Build status card
const totalRuns = workflows.length;
const successRuns = workflows.filter(w => w.conclusion === 'success').length;
const failedRuns = workflows.filter(w => w.conclusion === 'failure').length;

const statusCard = `
  <div class="card">
    <h2><span class="card-icon">⚙️</span> Automation Status</h2>
    <ul class="data-list">
      <li class="data-item">
        <span class="data-label">Total Runs</span>
        <span class="data-value">${totalRuns}</span>
      </li>
      <li class="data-item">
        <span class="data-label">Success Rate</span>
        <span class="data-value">${totalRuns > 0 ? Math.round(successRuns/totalRuns*100) : 0}%</span>
      </li>
      <li class="data-item">
        <span class="data-label">Recent Failures</span>
        <span class="data-value">${failedRuns}</span>
      </li>
    </ul>
  </div>
`;

// Build blog posts card
const blogPostsHtml = blogPosts.length > 0
  ? blogPosts.slice(0, 5).map(post => `
      <li class="data-item">
        <a href="https://github.com/jamiew/claude-gha-demo/blob/main/blog/${post.file}" target="_blank" class="headline-link">
          <span class="data-label">${post.title}</span>
          <span class="data-value" style="font-size:0.85rem;opacity:0.6;display:block;margin-top:2px;">${post.date}</span>
        </a>
      </li>
    `).join('')
  : '<li class="data-item"><span class="data-value">No blog posts yet</span></li>';

const blogCard = `
  <div class="card">
    <h2>
      <span class="card-icon">🤖</span>
      <a href="https://github.com/jamiew/claude-gha-demo/tree/main/blog" target="_blank" class="card-title-link">Robot Blog Posts</a>
    </h2>
    <ul class="data-list">
      ${blogPostsHtml}
    </ul>
    <div class="timestamp">
      Latest autonomous writings ·
      <a href="https://github.com/jamiew/claude-gha-demo/blob/main/.github/workflows/fetch-hackernews.yml" target="_blank" class="workflow-link">View workflow →</a>
    </div>
  </div>
`;

// Build debug card - pretty print all data
const allData = {
  nytimes: nytimes.headlines?.length > 0 ? { headlines: nytimes.headlines.length + ' headlines', last_updated: nytimes.last_updated } : nytimes,
  glif: { workflows: glif.featured_workflows?.length || 0, agents: glif.featured_agents?.length || 0, last_updated: glif.last_updated },
  weather: weather,
  crypto: { coins: Object.keys(crypto.coins || {}).length, last_updated: crypto.last_updated }
};
const debugCard = `
  <div class="card">
    <h2><span class="card-icon">🐛</span> Debug Data</h2>
    <pre class="debug-json">${JSON.stringify(allData, null, 2)}</pre>
    <div class="timestamp">Data sources summary</div>
  </div>
`;

// Build crypto prices card
const cryptoCoins = Object.values(crypto.coins || {});
const cryptoHtml = cryptoCoins.length > 0
  ? cryptoCoins.map(coin => {
      const priceChange = coin.change_24h || 0;
      const changeColor = priceChange >= 0 ? '#34c759' : '#ff3b30';
      const changeSign = priceChange >= 0 ? '+' : '';
      return `
      <li class="data-item">
        <span class="data-label">${coin.name} (${coin.symbol})</span>
        <span class="data-value" style="display:flex;justify-content:space-between;align-items:center;">
          <span>$${parseFloat(coin.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span style="color:${changeColor};font-size:0.9rem;font-weight:600;">${changeSign}${priceChange.toFixed(2)}%</span>
        </span>
      </li>`;
    }).join('')
  : '<li class="data-item"><span class="data-value">No crypto data yet</span></li>';

const cryptoCard = `
  <div class="card">
    <h2>
      <span class="card-icon">₿</span>
      <a href="https://github.com/jamiew/claude-gha-demo/blob/main/.github/workflows/fetch-crypto.yml" target="_blank" class="card-title-link">Crypto Prices</a>
    </h2>
    <ul class="data-list">
      ${cryptoHtml}
    </ul>
    <div class="timestamp">
      Updated: ${crypto.last_updated || 'Never'} ·
      <a href="https://github.com/jamiew/claude-gha-demo/actions/workflows/fetch-crypto.yml" target="_blank" class="workflow-link">View runs →</a>
    </div>
  </div>
`;

const contentHtml = weatherCard + nytCard + blogCard + glifWorkflowsCard + glifAgentsCard + cryptoCard + debugCard + statusCard;

// Build workflows section
const workflowsHtml = workflows.slice(0, 10).map(w => {
  const statusClass = w.conclusion === 'success' ? 'status-success' :
                    w.conclusion === 'failure' ? 'status-failure' : 'status-pending';
  const time = new Date(w.startedAt).toLocaleString();
  const url = `https://github.com/jamiew/claude-gha-demo/actions/runs/${w.databaseId}`;

  return `
    <div class="workflow-status">
      <div class="status-dot ${statusClass}"></div>
      <div class="workflow-name">${w.name}</div>
      <div class="workflow-time">${time}</div>
      <a href="${url}" class="workflow-link" target="_blank">View →</a>
    </div>
  `;
}).join('');

// Generate complete HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clactions: Automation Gone Wild</title>
  <style id="theme-light">
    /* Light theme */
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f5f5f7;
      --text-primary: #1a1a1a;
      --text-secondary: #6e6e73;
      --accent: #007aff;
      --accent-secondary: #5856d6;
      --border-color: rgba(0, 0, 0, 0.1);
    }
  </style>
  <style id="theme-dark">
    /* Dark theme */
    :root {
      --bg-primary: #000000;
      --bg-secondary: #1c1c1e;
      --text-primary: #ffffff;
      --text-secondary: #98989d;
      --accent: #0a84ff;
      --accent-secondary: #5e5ce6;
      --border-color: rgba(255, 255, 255, 0.1);
    }
  </style>
  <style id="theme-weather">
    /* Weather-adaptive theme */
${weatherAdaptiveTheme}
  </style>
  <style>
    /* Base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-primary, #1a1a1a);
      background: var(--bg-primary, #ffffff);
      padding: 1rem;
      transition: background 0.3s ease, color 0.3s ease;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      padding: 2rem 0 3rem;
      border-bottom: 2px solid var(--accent, #007aff);
      position: relative;
    }

    .theme-switcher {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .theme-toggle {
      background: var(--bg-secondary, #f5f5f7);
      border: 1px solid var(--border-color, rgba(0,0,0,0.1));
      border-radius: 12px;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      background: var(--accent, #007aff);
      color: white;
      transform: scale(1.05);
    }

    .theme-menu {
      display: none;
      position: absolute;
      top: 50px;
      right: 0;
      background: var(--bg-secondary, #f5f5f7);
      border: 1px solid var(--border-color, rgba(0,0,0,0.1));
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      overflow: hidden;
      min-width: 200px;
      z-index: 1000;
    }

    .theme-menu.open {
      display: block;
    }

    .theme-option {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
    }

    .theme-option:hover {
      background: var(--accent, #007aff);
      color: white;
    }

    .theme-option.active {
      background: var(--accent, #007aff);
      color: white;
      font-weight: 600;
    }

    .theme-icon {
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
    }

    h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--accent, #007aff), var(--accent-secondary, #5856d6));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 1.1rem;
      opacity: 0.7;
      font-weight: 300;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .card {
      background: var(--bg-secondary, #f5f5f7);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .card h2 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-icon {
      font-size: 1.5rem;
    }

    .card-title-link {
      color: inherit;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .card-title-link:hover {
      color: var(--accent, #007aff);
      text-decoration: underline;
    }

    .data-list {
      list-style: none;
    }

    .data-item {
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .data-item:last-child {
      border-bottom: none;
    }

    .data-label {
      font-weight: 600;
      color: var(--accent, #007aff);
      font-size: 0.9rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .data-value {
      font-size: 1.1rem;
    }

    .weather-big {
      font-size: 3rem;
      font-weight: 700;
      text-align: center;
      margin: 1rem 0;
    }

    .meta {
      background: rgba(0,0,0,0.03);
      border-radius: 12px;
      padding: 1rem;
      margin-top: 2rem;
    }

    .meta-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .workflow-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-secondary, #f5f5f7);
      border-radius: 8px;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-success { background: #34c759; }
    .status-failure { background: #ff3b30; }
    .status-pending { background: #ff9500; }

    .workflow-name {
      font-weight: 600;
      flex: 1;
    }

    .workflow-time {
      opacity: 0.6;
      font-size: 0.85rem;
    }

    .workflow-link {
      color: var(--accent, #007aff);
      text-decoration: none;
      font-size: 0.85rem;
    }

    .workflow-link:hover {
      text-decoration: underline;
    }

    .headline-link {
      color: inherit;
      text-decoration: none;
      display: block;
      transition: opacity 0.2s ease;
    }

    .headline-link:hover {
      opacity: 0.7;
    }

    .headline-link:hover .data-label {
      color: var(--accent, #007aff);
    }

    footer {
      text-align: center;
      padding: 3rem 0 2rem;
      opacity: 0.6;
      font-size: 0.9rem;
    }

    .timestamp {
      opacity: 0.5;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-style: italic;
    }

    .debug-json {
      background: rgba(0, 0, 0, 0.05);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--text-primary);
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      max-height: 400px;
      overflow-y: auto;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }

      header {
        padding: 1.5rem 0 2rem;
      }
    }

    /* Fun animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card {
      animation: fadeIn 0.5s ease-out;
      animation-fill-mode: both;
    }

    .card:nth-child(1) { animation-delay: 0.1s; }
    .card:nth-child(2) { animation-delay: 0.2s; }
    .card:nth-child(3) { animation-delay: 0.3s; }
    .card:nth-child(4) { animation-delay: 0.4s; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="theme-switcher">
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme menu">
          ☀️
        </button>
        <div class="theme-menu" id="theme-menu">
          <div class="theme-option" data-theme="weather">
            <span class="theme-icon">🌤️</span>
            <span>Weather-adaptive</span>
          </div>
          <div class="theme-option" data-theme="light">
            <span class="theme-icon">☀️</span>
            <span>Light</span>
          </div>
          <div class="theme-option" data-theme="dark">
            <span class="theme-icon">🌙</span>
            <span>Dark</span>
          </div>
          <div class="theme-option" data-theme="system">
            <span class="theme-icon">💻</span>
            <span>System</span>
          </div>
        </div>
      </div>
      <h1>🤖 Clactions: Automation Gone Wild</h1>
      <p class="subtitle">Self-improving AI infrastructure</p>
    </header>

    <div class="grid">
${contentHtml}
    </div>

    <div class="meta">
      <h2 class="meta-title">🔧 System Status</h2>
${workflowsHtml}
      <div class="timestamp">
        Dashboard built: ${new Date().toISOString()}
      </div>
    </div>

    <footer>
      <p><strong>Autonomous automation</strong> powered by Claude</p>
      <p><a href="https://github.com/jamiew/claude-gha-demo" class="workflow-link">View on GitHub</a></p>
    </footer>
  </div>

  <script>
    // Theme switcher logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const themeStyles = {
      light: document.getElementById('theme-light'),
      dark: document.getElementById('theme-dark'),
      weather: document.getElementById('theme-weather')
    };

    const themeIcons = {
      weather: '🌤️',
      light: '☀️',
      dark: '🌙',
      system: '💻'
    };

    // Toggle menu
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeToggle) {
        themeMenu.classList.remove('open');
      }
    });

    // Load saved theme or default to weather-adaptive
    const savedTheme = localStorage.getItem('selected-theme') || 'weather';
    applyTheme(savedTheme);

    // Handle theme selection
    themeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const theme = option.dataset.theme;
        applyTheme(theme);
        localStorage.setItem('selected-theme', theme);
        themeMenu.classList.remove('open');
      });
    });

    function applyTheme(theme) {
      // Handle system theme
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
      }

      // Disable all theme styles
      Object.values(themeStyles).forEach(style => {
        if (style) style.disabled = true;
      });

      // Enable selected theme
      if (themeStyles[theme]) {
        themeStyles[theme].disabled = false;
      }

      // Update toggle icon
      const displayTheme = localStorage.getItem('selected-theme') || 'weather';
      themeToggle.textContent = themeIcons[displayTheme];

      // Update active state
      themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === displayTheme);
      });
    }

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const savedTheme = localStorage.getItem('selected-theme');
      if (savedTheme === 'system') {
        applyTheme('system');
      }
    });
  </script>
</body>
</html>`;

// Write to dist/index.html
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
console.log('Dashboard built!');
