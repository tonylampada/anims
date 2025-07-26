# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive animation gallery hosted on GitHub Pages at https://tonylampada.github.io/anims/. The project uses HTML5 Canvas animations with a modular ES6 architecture bundled by Rollup.

## Development Commands

```bash
npm install          # Install dependencies
npm run build        # Build production bundle
npm run dev          # Build with watch mode
npm run serve        # Start local server on port 8000
```

Deploy by pushing to `main` branch - GitHub Actions automatically builds and deploys.

## Architecture

### Build System
- **Rollup** bundles ES6 modules from `src/` into `js/bundle.js`
- Entry point: `src/main.js`
- GitHub Actions runs build on every push

### Code Structure
```
src/
├── core/
│   ├── Animation.js    # Base animation class
│   └── Gallery.js      # Gallery controller
├── animations/
│   ├── index.js        # Animation registry
│   ├── particles/      # Each animation in its folder
│   └── space-tunnel/
└── main.js             # Entry point
```

### Animation Interface
New animations must:
1. Extend `Animation` class from `src/core/Animation.js`
2. Implement `update()` and `draw()` methods
3. Override `metadata` getter with title/description
4. Export as default from their folder

### Adding Animations
1. Create folder in `src/animations/your-animation/`
2. Create `index.js` extending Animation class
3. Add to exports in `src/animations/index.js`
4. Run `npm run build`

## CI/CD

GitHub Actions workflow (`.github/workflows/build.yml`):
- Installs dependencies
- Runs `npm run build`
- Deploys to GitHub Pages

Monitor with: `gh run list --limit 1`