# Style Guide

This document outlines the JavaScript and CSS style conventions for the project. Adhering to these rules ensures code consistency, readability, and performance.

## JavaScript Style Rules

The project follows the Airbnb Style Guide, enforced by ESLint. The configuration can be found in `.eslintrc.js`.

1.  **Modules**: Always use ES Modules (`import`/`export`). CommonJS (`require`/`module.exports`) is not used in this project.
    ```javascript
    // Good
    import { div } from '../../scripts/dom-builder.js';
    export default function decorate(block) { /* ... */ }

    // Bad
    const { div } = require('../../scripts/dom-builder.js');
    module.exports = function decorate(block) { /* ... */ }
    ```

2.  **No Third-Party Dependencies**: Do not add third-party libraries (like jQuery, Lodash, React, etc.) to the project. The goal is to keep the footprint minimal and rely on native browser APIs and the provided helpers in `/scripts/`. If a library is absolutely necessary, it must be approved and loaded asynchronously via `delayed.js`.

3.  **Function Style**: Use `function` declarations for top-level functions and `const` with arrow functions for callbacks and local helpers. All block `decorate` functions must be `async`.
    ```javascript
    // Good
    export default async function decorate(block) {
      const handleClick = (e) => {
        console.log(e.target);
      };
      block.addEventListener('click', handleClick);
    }
    ```

4.  **Comments**: Use JSDoc-style comments for all public functions, especially the `decorate` function in blocks, to explain their purpose, parameters, and return values.
    ```javascript
    /**
     * Decorates the footer block.
     * @param {Element} block The footer block element
     */
    export default async function decorate(block) {
      // ...
    }
    ```

5.  **Naming Conventions**:
    - Use `camelCase` for variables and functions.
    - Use `PascalCase` for classes (though classes should be used sparingly).
    - File names should be `kebab-case`.

## CSS Style Rules

CSS should be clean, efficient, and strictly scoped to avoid unintended side effects.

1.  **Scoping**: All block-specific styles must be scoped to the block's root element. The AEM EDS boilerplate automatically adds the block's name as a class to the block's wrapper element.
    ```css
    /* /blocks/cards/cards.css */

    /* Good: Styles are scoped to the .cards block */
    .cards {
      display: grid;
      gap: 1rem;
    }

    .cards .card-item {
      border: 1px solid #eee;
    }

    /* Bad: Global style leak */
    .card-item {
      border: 1px solid #eee; /* This could affect other elements on the site */
    }
    ```

2.  **CSS Variables**: Use CSS variables for common values like colors, fonts, and spacing. Global variables are defined in `/styles/styles.css` and can be overridden for specific blocks if necessary.
    ```css
    :root {
      --primary-color: #007bff;
      --spacing-medium: 16px;
    }

    .button {
      background-color: var(--primary-color);
      padding: var(--spacing-medium);
    }
    ```

3.  **No Global Leaks**: Never define styles in a block's CSS file that could affect elements outside of that block. Avoid styling general HTML tags like `p`, `h2`, or `a` without a scoping class.

4.  **Performance**:
    - Avoid overly complex selectors that are slow for the browser to parse.
    - Prefer CSS animations and transitions over JavaScript-based animations.
    - Use `content-visibility` and `contain` properties where appropriate to improve rendering performance.

## Accessibility (A11y)

Accessibility is a primary requirement.

1.  **Semantic HTML**: Use HTML elements for their intended purpose (e.g., `<nav>`, `<button>`, `<main>`).
2.  **ARIA Roles**: Use ARIA (Accessible Rich Internet Applications) attributes to define the roles and states of dynamic UI components (e.g., `role="dialog"`, `aria-expanded="false"`).
3.  **Keyboard Navigation**: All interactive elements must be focusable and operable via the keyboard.
4.  **Focus Management**: For dynamic components like modals or menus, ensure focus is managed correctly (e.g., trapped within a modal when it's open).

## Performance Budgets

To ensure a fast user experience, we adhere to the following performance budgets, measured by Google Lighthouse:

- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total JavaScript Bundle Size (main + delayed)**: < 200KB (gzipped)
- **Lighthouse Performance Score**: 100
