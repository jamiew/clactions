#!/usr/bin/env node

/**
 * Deterministic adaptive theme generator
 * Replaces Claude LLM with pure logic-based theme generation
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const hour = parseInt(process.argv[2] || new Date().getHours());
const month = parseInt(process.argv[3] || (new Date().getMonth() + 1));
const dayOfYear = parseInt(process.argv[4] || getDayOfYear());
const temperature = process.argv[5] || 'unknown';
const condition = process.argv[6] || 'unknown';

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getSeason(month, dayOfYear) {
  // Northern hemisphere seasons
  if (month === 12 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'fall';
}

function getTimeOfDay(hour) {
  if (hour >= 20 || hour <= 5) return 'night';
  if (hour >= 6 && hour <= 8) return 'early-morning';
  if (hour >= 9 && hour <= 16) return 'day';
  return 'evening';
}

function getWeatherMood(condition, temp) {
  const condLower = condition.toLowerCase();
  const tempNum = parseInt(temp);

  if (condLower.includes('rain') || condLower.includes('drizzle')) return 'rainy';
  if (condLower.includes('snow')) return 'snowy';
  if (condLower.includes('cloud') || condLower.includes('overcast')) return 'cloudy';
  if (condLower.includes('clear') || condLower.includes('sunny')) return 'sunny';

  // Temperature-based fallback
  if (!isNaN(tempNum)) {
    if (tempNum > 80) return 'hot';
    if (tempNum < 40) return 'cold';
  }

  return 'neutral';
}

function getThemeColors(timeOfDay, season, weatherMood) {
  const themes = {
    // Night themes
    'night-winter-rainy': {
      bgPrimary: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)',
      bgSecondary: 'rgba(26, 35, 50, 0.7)',
      bgCard: 'rgba(31, 43, 61, 0.85)',
      textPrimary: '#e8edf5',
      textSecondary: '#b8c5db',
      accentPrimary: '#5eb3d6',
      accentSecondary: '#4a9bc4',
      accentGlow: '#73c5e8',
      shadowGlow: 'rgba(94, 179, 214, 0.15)',
    },
    'night-winter-snowy': {
      bgPrimary: 'linear-gradient(135deg, #0d1521 0%, #1c2b42 100%)',
      bgSecondary: 'rgba(28, 43, 66, 0.7)',
      bgCard: 'rgba(35, 52, 82, 0.85)',
      textPrimary: '#f0f4fa',
      textSecondary: '#c8d6ed',
      accentPrimary: '#a8d8f0',
      accentSecondary: '#82c4e8',
      accentGlow: '#c2e5f7',
      shadowGlow: 'rgba(168, 216, 240, 0.2)',
    },
    'night-winter': {
      bgPrimary: 'linear-gradient(135deg, #0a0e1a 0%, #1a2333 100%)',
      bgSecondary: 'rgba(26, 35, 51, 0.7)',
      bgCard: 'rgba(32, 45, 66, 0.85)',
      textPrimary: '#e0e8f0',
      textSecondary: '#a8b8d1',
      accentPrimary: '#6ba3d1',
      accentSecondary: '#5088b8',
      accentGlow: '#85b8db',
      shadowGlow: 'rgba(107, 163, 209, 0.15)',
    },
    'night-spring': {
      bgPrimary: 'linear-gradient(135deg, #0f1a1f 0%, #1a2d35 100%)',
      bgSecondary: 'rgba(26, 45, 53, 0.7)',
      bgCard: 'rgba(35, 58, 70, 0.85)',
      textPrimary: '#e5f0ed',
      textSecondary: '#b5d1c9',
      accentPrimary: '#5dbf8f',
      accentSecondary: '#4aa378',
      accentGlow: '#75d1a3',
      shadowGlow: 'rgba(93, 191, 143, 0.15)',
    },
    'night-summer': {
      bgPrimary: 'linear-gradient(135deg, #1a1614 0%, #2d2620 100%)',
      bgSecondary: 'rgba(45, 38, 32, 0.7)',
      bgCard: 'rgba(58, 48, 40, 0.85)',
      textPrimary: '#f0e8dc',
      textSecondary: '#d1c2b0',
      accentPrimary: '#ffa94d',
      accentSecondary: '#ff8c42',
      accentGlow: '#ffb366',
      shadowGlow: 'rgba(255, 169, 77, 0.15)',
    },
    'night-fall-rainy': {
      bgPrimary: 'linear-gradient(135deg, #1a1f2e 0%, #2d3548 100%)',
      bgSecondary: 'rgba(45, 53, 72, 0.7)',
      bgCard: 'rgba(58, 68, 92, 0.85)',
      textPrimary: '#e8edf5',
      textSecondary: '#b8c5db',
      accentPrimary: '#ffa94d',
      accentSecondary: '#ff8c42',
      accentGlow: '#ffb366',
      shadowGlow: 'rgba(255, 169, 77, 0.15)',
    },
    'night-fall': {
      bgPrimary: 'linear-gradient(135deg, #1a1410 0%, #2d2318 100%)',
      bgSecondary: 'rgba(45, 35, 24, 0.7)',
      bgCard: 'rgba(58, 45, 32, 0.85)',
      textPrimary: '#f0e4d0',
      textSecondary: '#d1bfa0',
      accentPrimary: '#e68a3d',
      accentSecondary: '#d4704d',
      accentGlow: '#f5a256',
      shadowGlow: 'rgba(230, 138, 61, 0.15)',
    },

    // Early morning themes
    'early-morning-spring': {
      bgPrimary: 'linear-gradient(135deg, #f5e8d8 0%, #e8d4c0 100%)',
      bgSecondary: 'rgba(232, 212, 192, 0.7)',
      bgCard: 'rgba(245, 232, 216, 0.9)',
      textPrimary: '#2d2520',
      textSecondary: '#5a4a3d',
      accentPrimary: '#d4835c',
      accentSecondary: '#c4673a',
      accentGlow: '#e69d75',
      shadowGlow: 'rgba(212, 131, 92, 0.2)',
    },
    'early-morning': {
      bgPrimary: 'linear-gradient(135deg, #ffecd1 0%, #ffd8a8 100%)',
      bgSecondary: 'rgba(255, 216, 168, 0.7)',
      bgCard: 'rgba(255, 236, 209, 0.9)',
      textPrimary: '#2d2010',
      textSecondary: '#5a4428',
      accentPrimary: '#e67e22',
      accentSecondary: '#d35400',
      accentGlow: '#f39c3d',
      shadowGlow: 'rgba(230, 126, 34, 0.2)',
    },

    // Day themes
    'day-winter-snowy': {
      bgPrimary: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%)',
      bgSecondary: 'rgba(224, 240, 255, 0.7)',
      bgCard: 'rgba(240, 248, 255, 0.9)',
      textPrimary: '#1a2840',
      textSecondary: '#3d5270',
      accentPrimary: '#3498db',
      accentSecondary: '#2980b9',
      accentGlow: '#5dade2',
      shadowGlow: 'rgba(52, 152, 219, 0.2)',
    },
    'day-spring': {
      bgPrimary: 'linear-gradient(135deg, #e8f8f0 0%, #d0ede0 100%)',
      bgSecondary: 'rgba(208, 237, 224, 0.7)',
      bgCard: 'rgba(232, 248, 240, 0.9)',
      textPrimary: '#1a3d2e',
      textSecondary: '#2d6350',
      accentPrimary: '#27ae60',
      accentSecondary: '#229954',
      accentGlow: '#52be80',
      shadowGlow: 'rgba(39, 174, 96, 0.2)',
    },
    'day-summer-sunny': {
      bgPrimary: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
      bgSecondary: 'rgba(255, 236, 179, 0.7)',
      bgCard: 'rgba(255, 248, 225, 0.9)',
      textPrimary: '#3d2e1a',
      textSecondary: '#6b5030',
      accentPrimary: '#f39c12',
      accentSecondary: '#e67e22',
      accentGlow: '#f9b851',
      shadowGlow: 'rgba(243, 156, 18, 0.25)',
    },
    'day-summer': {
      bgPrimary: 'linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%)',
      bgSecondary: 'rgba(253, 235, 208, 0.7)',
      bgCard: 'rgba(254, 245, 231, 0.9)',
      textPrimary: '#3d3020',
      textSecondary: '#6b5840',
      accentPrimary: '#e67e22',
      accentSecondary: '#d35400',
      accentGlow: '#f39c3d',
      shadowGlow: 'rgba(230, 126, 34, 0.2)',
    },
    'day-fall': {
      bgPrimary: 'linear-gradient(135deg, #fdf0e6 0%, #f8e2d0 100%)',
      bgSecondary: 'rgba(248, 226, 208, 0.7)',
      bgCard: 'rgba(253, 240, 230, 0.9)',
      textPrimary: '#3d2818',
      textSecondary: '#6b4830',
      accentPrimary: '#d68358',
      accentSecondary: '#c4673a',
      accentGlow: '#e69d75',
      shadowGlow: 'rgba(214, 131, 88, 0.2)',
    },
    'day': {
      bgPrimary: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      bgSecondary: 'rgba(245, 245, 245, 0.7)',
      bgCard: 'rgba(255, 255, 255, 0.9)',
      textPrimary: '#2d2d2d',
      textSecondary: '#5a5a5a',
      accentPrimary: '#3498db',
      accentSecondary: '#2980b9',
      accentGlow: '#5dade2',
      shadowGlow: 'rgba(52, 152, 219, 0.2)',
    },

    // Evening themes
    'evening-summer': {
      bgPrimary: 'linear-gradient(135deg, #ffe8d1 0%, #ffd4a8 100%)',
      bgSecondary: 'rgba(255, 212, 168, 0.7)',
      bgCard: 'rgba(255, 232, 209, 0.9)',
      textPrimary: '#3d2510',
      textSecondary: '#6b4528',
      accentPrimary: '#ff8c42',
      accentSecondary: '#e67e22',
      accentGlow: '#ffa94d',
      shadowGlow: 'rgba(255, 140, 66, 0.25)',
    },
    'evening-fall': {
      bgPrimary: 'linear-gradient(135deg, #ffe0c1 0%, #ffc896 100%)',
      bgSecondary: 'rgba(255, 200, 150, 0.7)',
      bgCard: 'rgba(255, 224, 193, 0.9)',
      textPrimary: '#3d2010',
      textSecondary: '#6b3d28',
      accentPrimary: '#e67e22',
      accentSecondary: '#d4704d',
      accentGlow: '#f39c3d',
      shadowGlow: 'rgba(230, 126, 34, 0.25)',
    },
    'evening': {
      bgPrimary: 'linear-gradient(135deg, #ffebd8 0%, #ffd4b3 100%)',
      bgSecondary: 'rgba(255, 212, 179, 0.7)',
      bgCard: 'rgba(255, 235, 216, 0.9)',
      textPrimary: '#3d2818',
      textSecondary: '#6b4530',
      accentPrimary: '#e67e22',
      accentSecondary: '#d35400',
      accentGlow: '#f39c3d',
      shadowGlow: 'rgba(230, 126, 34, 0.2)',
    },
  };

  // Try specific combinations first
  const keys = [
    `${timeOfDay}-${season}-${weatherMood}`,
    `${timeOfDay}-${season}`,
    `${timeOfDay}-${weatherMood}`,
    timeOfDay,
    'day', // fallback
  ];

  for (const key of keys) {
    if (themes[key]) return themes[key];
  }

  return themes.day;
}

function generateCSS(hour, month, dayOfYear, temperature, condition) {
  const season = getSeason(month, dayOfYear);
  const timeOfDay = getTimeOfDay(hour);
  const weatherMood = getWeatherMood(condition, temperature);
  const colors = getThemeColors(timeOfDay, season, weatherMood);

  const timestamp = new Date().toISOString();
  const tempDisplay = temperature !== 'unknown' ? `${temperature}°F` : 'unknown';

  // Build vibe description
  let vibe = [];
  if (timeOfDay === 'night') vibe.push('nighttime');
  else if (timeOfDay === 'early-morning') vibe.push('early morning');
  else if (timeOfDay === 'evening') vibe.push('evening');
  else vibe.push('daytime');

  if (season) vibe.push(season);
  if (weatherMood !== 'neutral') vibe.push(weatherMood);

  const css = `/* Generated: ${timestamp}
 * Hour: ${hour} (${timeOfDay}), Month: ${getMonthName(month)}, Day: ${dayOfYear}
 * Weather: ${condition}, ${tempDisplay}
 * Vibe: ${vibe.join(', ')}
 */

:root {
  /* Core colors - ${timeOfDay} ${season} ${weatherMood} palette */
  --bg-primary: ${colors.bgPrimary};
  --bg-secondary: ${colors.bgSecondary};
  --bg-card: ${colors.bgCard};
  --bg-glass: rgba(${timeOfDay === 'night' ? '42, 50, 68' : '255, 255, 255'}, 0.6);

  /* Text colors */
  --text-primary: ${colors.textPrimary};
  --text-secondary: ${colors.textSecondary};
  --text-muted: ${adjustOpacity(colors.textSecondary, 0.7)};

  /* Accent colors */
  --accent-primary: ${colors.accentPrimary};
  --accent-secondary: ${colors.accentSecondary};
  --accent-glow: ${colors.accentGlow};
  --accent-cool: ${timeOfDay === 'night' ? '#6c8fc9' : '#3498db'};

  /* Seasonal accents */
  ${getSeasonalAccents(season, weatherMood)}

  /* Effects */
  --shadow-soft: 0 4px 20px rgba(0, 0, 0, ${timeOfDay === 'night' ? '0.4' : '0.15'});
  --shadow-medium: 0 8px 32px rgba(0, 0, 0, ${timeOfDay === 'night' ? '0.5' : '0.2'});
  --shadow-glow: 0 0 40px ${colors.shadowGlow};
  --border-subtle: ${timeOfDay === 'night' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  --overlay: ${timeOfDay === 'night' ? 'rgba(26, 31, 46, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
}

/* Base styles */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.5s ease;
  position: relative;
}

/* Atmospheric overlay */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${getAtmosphericOverlay(timeOfDay, weatherMood)}
  pointer-events: none;
  z-index: -1;
}

/* Card/Container styles */
.card, .container, article {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: var(--shadow-medium);
  transition: all 0.3s ease;
}

.card:hover, article:hover {
  box-shadow: var(--shadow-glow), var(--shadow-medium);
  border-color: ${adjustOpacity(colors.accentPrimary, 0.3)};
  transform: translateY(-2px);
}

/* Links and interactive elements */
a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

a:hover {
  color: var(--accent-glow);
  text-shadow: 0 0 20px ${adjustOpacity(colors.accentGlow, 0.4)};
}

a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-secondary);
  transition: width 0.3s ease;
}

a:hover::after {
  width: 100%;
}

/* Buttons */
button, .button {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: ${timeOfDay === 'night' ? '#1a1f2e' : '#ffffff'};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  transition: all 0.3s ease;
}

button:hover, .button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow), var(--shadow-soft);
  filter: brightness(1.1);
}

/* Headers */
h1, h2, h3 {
  color: var(--text-primary);
  text-shadow: 0 2px 10px rgba(0, 0, 0, ${timeOfDay === 'night' ? '0.3' : '0.1'});
}

h1 {
  background: linear-gradient(135deg, var(--accent-glow) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

${getWeatherEffect(weatherMood)}

/* Glass morphism elements */
.glass {
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-soft);
}

/* Code blocks */
pre, code {
  background: ${timeOfDay === 'night' ? 'rgba(26, 31, 46, 0.6)' : 'rgba(245, 245, 245, 0.8)'};
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--accent-glow);
}

/* Status indicators */
.status-active {
  color: var(--accent-primary);
  text-shadow: 0 0 10px ${adjustOpacity(colors.accentPrimary, 0.5)};
}

.status-info {
  color: var(--accent-cool);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :root {
    --shadow-soft: 0 2px 10px rgba(0, 0, 0, ${timeOfDay === 'night' ? '0.4' : '0.15'});
    --shadow-medium: 0 4px 16px rgba(0, 0, 0, ${timeOfDay === 'night' ? '0.5' : '0.2'});
  }
}

/* Smooth transitions for theme changes */
* {
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
`;

  return css;
}

function getMonthName(month) {
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month] || 'Unknown';
}

function getSeasonalAccents(season, weatherMood) {
  const accents = {
    winter: `--seasonal-primary: #6ba3d1;
  --seasonal-secondary: #5088b8;
  --seasonal-accent: #85b8db;`,
    spring: `--seasonal-primary: #5dbf8f;
  --seasonal-secondary: #4aa378;
  --seasonal-accent: #75d1a3;`,
    summer: `--seasonal-primary: #ffa94d;
  --seasonal-secondary: #ff8c42;
  --seasonal-accent: #ffb366;`,
    fall: `--seasonal-primary: #d4835c;
  --seasonal-secondary: #a85e3a;
  --seasonal-accent: #e69d75;`,
  };

  return accents[season] || accents.summer;
}

function getAtmosphericOverlay(timeOfDay, weatherMood) {
  if (weatherMood === 'rainy' && timeOfDay === 'night') {
    return `background:
    radial-gradient(circle at 30% 20%, rgba(255, 169, 77, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(108, 143, 201, 0.12) 0%, transparent 50%);`;
  }
  if (weatherMood === 'snowy') {
    return `background:
    radial-gradient(circle at 40% 30%, rgba(168, 216, 240, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 60% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);`;
  }
  if (timeOfDay === 'evening') {
    return `background:
    radial-gradient(circle at 20% 20%, rgba(255, 140, 66, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(230, 126, 34, 0.1) 0%, transparent 50%);`;
  }
  if (timeOfDay === 'early-morning') {
    return `background:
    radial-gradient(circle at 50% 10%, rgba(255, 236, 209, 0.2) 0%, transparent 60%);`;
  }

  return `background: transparent;`;
}

function getWeatherEffect(weatherMood) {
  if (weatherMood === 'rainy') {
    return `/* Rain effect pattern */
.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(transparent 50%, rgba(74, 95, 127, 0.03) 50%);
  background-size: 100% 4px;
  pointer-events: none;
  opacity: 0.5;
}`;
  }

  if (weatherMood === 'snowy') {
    return `/* Snow effect shimmer */
.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  opacity: 0.3;
}`;
  }

  return '';
}

function adjustOpacity(color, opacity) {
  // Simple helper to add opacity to hex colors
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

// Generate and output CSS
const css = generateCSS(hour, month, dayOfYear, temperature, condition);
console.log(css);
