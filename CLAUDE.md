# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive animation gallery hosted on GitHub Pages at https://tonylampada.github.io/anims/. The project showcases HTML5 Canvas animations with a modular architecture for easy expansion.

## Development Commands

Since this is a vanilla JavaScript project without a build process:
- **Run locally**: `python3 -m http.server 8000` (then access http://localhost:8000)
- **Deploy**: Push to `main` branch triggers automatic GitHub Pages deployment

## Architecture

### Current Implementation
The project uses `js/app.js` which contains all code in a single file to avoid ES6 module issues on GitHub Pages:
- `Animation` base class - provides canvas management, resize handling, and animation loop
- `ParticlesAnimation` - interactive particle system implementation
- `AnimationGallery` - manages animation switching and UI updates

### Animation System
Each animation must:
1. Extend the `Animation` base class
2. Implement `update()` and `draw()` methods
3. Override `metadata` getter to provide title/description
4. Handle mouse/keyboard events if needed

### Adding New Animations
To add a new animation to the gallery:
1. Add the animation class to `js/app.js`
2. Add it to the `animations` array in `AnimationGallery` constructor
3. The gallery will automatically handle navigation and display

## GitHub Pages Deployment

The site is automatically deployed when pushing to the `main` branch. Monitor deployment status with:
```bash
gh run list --limit 1
```

## Important Notes

- Module imports must use absolute paths with `/anims/` prefix for GitHub Pages
- Currently using a single-file approach (`app.js`) to avoid ES6 module compatibility issues
- The modular architecture exists in `js/gallery.js` and `animations/` but isn't currently active due to module loading issues on GitHub Pages