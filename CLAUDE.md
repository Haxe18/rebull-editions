# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static showcase website for Red Bull editions across 64 countries. It uses vanilla JavaScript with no build process, served directly via GitHub Pages at https://rebull-editions.dj/.

## Architecture

### Core Structure
- **Static site** - No build process, direct file serving
- **Dual-repository system**: This repo displays data; separate generator repo creates/updates the data
- **Automated data sync**: GitHub Actions workflow pulls updates from generator repository daily
- **Zero runtime dependencies**: Only dev dependency is http-server for local development

### Key Files
- `index.html`: Main application shell with modal templates
- `js/app.js`: Core application logic, filtering, search, and modal handling
- `js/editions.js`: Generated data file with all Red Bull editions (5000+ lines)
- `css/styles.css`: All styling including CSS variables for theming
- `.github/workflows/update-data.yml`: Automated data sync workflow

## Development Commands

```bash
# Install development server
npm install

# Run local development server
npm start
# Opens at http://localhost:8080

# Deploy to GitHub Pages (automatic on push to main)
git push origin main

# Manual data update (normally automated)
# Fetches latest from generator repository
```

## Important Implementation Details

### Image Prioritization Logic
The app uses a smart fallback system for product images:
1. Try US edition image first (highest quality)
2. Fall back to UK edition
3. Fall back to International edition  
4. Use placeholder if all fail

Located in `js/app.js:getImageUrl()` and `js/app.js:getModalImageUrl()`

### Modal System
Two modal types:
- **Country modal**: Shows all editions for a selected country
- **Product iframe modal**: Displays Red Bull product pages
Both implement proper scroll locking and keyboard navigation.

### Theme System
CSS variables enable automatic dark/light mode:
- Variables defined in `:root` and `[data-theme="dark"]`
- JavaScript detects system preference and applies theme
- No external CSS framework needed

### Data Update Workflow
1. Generator repository creates new `editions.js` file
2. GitHub Action runs daily at 2 AM UTC
3. If changes detected, creates PR with changelog
4. Auto-merges if no conflicts
5. Deploys to GitHub Pages automatically

### Error Handling
- All fetch operations have retry logic with exponential backoff
- Images have multiple fallback sources
- Console errors are caught and logged gracefully
- Modal operations have try-catch blocks for resilience

## Testing Approach

No formal test suite. Manual testing checklist:
1. Search functionality across all countries
2. Filter buttons (All/Sugarfree/Regular)
3. Modal opening/closing with Escape key
4. Image loading and fallbacks
5. Dark/light theme switching
6. Mobile responsiveness

## Environment Configuration

No environment variables required. All configuration is hardcoded:
- GitHub Pages URL: https://rebull-editions.dj/
- Data repository: Haxe18/rebull-editions-scraper-test
- Update schedule: Daily at 2 AM UTC

## Key Patterns to Follow

1. **No build step**: Keep everything as vanilla JS/CSS/HTML
2. **Progressive enhancement**: Core functionality works without JS
3. **CSS variables**: Use for all theme-able properties
4. **Semantic HTML**: Maintain accessibility standards
5. **Graceful degradation**: Always provide fallbacks for images/data

## Common Tasks

### Adding a new feature
Edit files directly in `js/app.js`, `css/styles.css`, or `index.html`. No compilation needed.

### Modifying the data structure
Changes must be made in the generator repository, not here. The `editions.js` file is auto-generated.

### Updating styles
All styles are in `css/styles.css`. Use CSS variables for colors that change with theme.

### Debugging data issues
Check the GitHub Actions logs for the daily update workflow. Data problems originate from the scraper repository.

## Performance Considerations

- Images are served from Red Bull's CDN (ecomm.redbull.com)
- Minimal DOM manipulation - uses efficient batch updates
- No external JavaScript libraries to reduce bundle size
- CSS animations use transform/opacity for GPU acceleration