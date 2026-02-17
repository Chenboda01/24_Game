# AGENTS.md - 24 Game Project Guidelines

## Project Overview

**24 Game** is a mathematical puzzle solver implemented as a static web application. The goal is to use four numbers and basic arithmetic operations (+, -, ×, ÷) to reach the target number 24, using each number exactly once.

The project is intended to be deployed via GitHub Pages at https://chenboda01.github.io/24_Game/.

**Current Technology Stack**: Plain HTML, CSS, and JavaScript (no frameworks currently).

## Current Repository State

**Analysis Date**: February 16, 2026  
**Findings**: 
- The repository currently contains only README.md files (root and `/24_Game/`).
- No source files (`index.html`, `.js`, `.css`) are present.
- No configuration files (`package.json`, `tsconfig.json`, `.eslintrc`, `.prettierrc`, etc.) exist.
- No build scripts, test files, or linter configurations.
- No Cursor rules (`.cursor/rules/` or `.cursorrules`) or Copilot instructions (`.github/copilot-instructions.md`).

**Implication**: This is a greenfield project. All conventions and tooling need to be established.

## Recommended Project Setup

### 1. Package Management
Initialize `package.json` with npm:
```bash
npm init -y
```

### 2. Development Dependencies
Install essential tooling for linting, formatting, and testing:
```bash
npm install --save-dev eslint prettier stylelint jest
```

### 3. Build Tool
Since this is a static site, consider a simple bundler like **Parcel** for development server and production builds:
```bash
npm install --save-dev parcel
```

### 4. Directory Structure
Create a conventional structure:
```
24_Game/
├── index.html          # Entry point
├── styles/
│   └── main.css       # Global styles
├── scripts/
│   └── game.js        # Core game logic
├── assets/            # Images, fonts, etc.
└── tests/             # Unit tests
```

## Build / Lint / Test Commands

Add these scripts to `package.json` once created:

### Build Commands
```json
{
  "scripts": {
    "dev": "parcel index.html",
    "build": "parcel build index.html --public-url ./",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Lint Commands
```json
{
  "scripts": {
    "lint:js": "eslint scripts/ --fix",
    "lint:css": "stylelint styles/ --fix",
    "lint:html": "htmlhint index.html",
    "lint": "npm run lint:js && npm run lint:css && npm run lint:html",
    "format": "prettier --write ."
  }
}
```

### Test Commands
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Running a Single Test**:
```bash
npm test -- --testPathPattern=game.test.js
# or with Jest directly
npx jest game.test.js
```

## Code Style Guidelines

### General Principles
- **KISS**: Keep it simple; prefer vanilla JS over frameworks unless complexity demands.
- **Accessibility**: Ensure the game is keyboard-navigable and screen‑reader friendly.
- **Mobile‑first**: Design for small screens first, then enhance for larger displays.

### HTML
- Use semantic HTML5 elements (`<main>`, `<section>`, `<button>`, etc.).
- Indent with 2 spaces, never tabs.
- Always include `alt` attributes on images, `aria‑label` on interactive elements without visible text.
- Close all tags (even self‑closing like `<img />`).
- Use double quotes for attributes.

### CSS
- Follow **BEM** naming convention (`.block`, `.block__element`, `.block--modifier`).
- Organize styles in the order: layout → typography → colors → animations.
- Use CSS variables for theming (e.g., `--primary-color`).
- Avoid `!important`; use specificity wisely.
- Use flexbox/grid for layouts; avoid float‑based hacks.
- Mobile‑first media queries:
  ```css
  .element { … }
  @media (min‑width: 768px) { … }
  ```

### JavaScript
- **ES6+** features encouraged (`const`/`let`, arrow functions, template literals, destructuring).
- Use **module pattern** (ES modules) for code organization.
- Avoid global variables; encapsulate state in dedicated objects or classes.
- **Error handling**: Use `try…catch` for predictable failures (e.g., parsing user input). Never leave empty catch blocks.
- **Naming**:
  - `camelCase` for variables/functions.
  - `PascalCase` for classes/constructors.
  - `UPPER_SNAKE_CASE` for constants.
- **Imports**: Group imports by origin (external libraries first, then internal modules).
  ```javascript
  // External dependencies
  import { something } from 'library';
  // Internal modules
  import { helper } from './utils.js';
  ```
- **Comments**: JSDoc for public functions; inline comments only for non‑obvious logic.
- **Type safety**: Consider adding JSDoc type annotations if TypeScript is not adopted.

### Testing
- Write unit tests with **Jest** for all game‑logic functions.
- Test file naming: `*.test.js` alongside source files (or in `__tests__` directories).
- Follow AAA pattern (Arrange‑Act‑Assert).
- Mock DOM APIs when testing UI functions.

## Cursor / Copilot Rules

No Cursor or Copilot rules are currently defined. Consider adding the following if using these tools:

### Suggested Cursor Rules (`.cursor/rules/`)
- Enforce the code style guidelines above.
- Prioritize accessibility attributes in HTML autocomplete.
- Suggest BEM class names when writing CSS.

### Suggested Copilot Instructions (`.github/copilot‑instructions.md`)
- Describe the project’s purpose and constraints.
- Remind about mobile‑first design and keyboard navigation.

## Additional Notes

### Deployment
- The project is set up for GitHub Pages. The `gh‑pages` package can automate deployment to the `gh‑pages` branch.
- Ensure the `build` script outputs to `dist/` (or another directory that GitHub Pages serves).

### Future Considerations
- **TypeScript**: If the codebase grows, consider migrating to TypeScript for better type safety.
- **Framework**: If UI complexity increases, a lightweight framework like **Preact** or **Vue** could be introduced.
- **CI/CD**: Add GitHub Actions for automatic linting, testing, and deployment on push to `main`.

### Quick Start for New Contributors
1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev` to start the development server.
4. Write code following the guidelines above.
5. Run `npm run lint` and `npm test` before committing.

---

*This AGENTS.md file was generated automatically based on analysis of the repository. Update it as the project evolves.*