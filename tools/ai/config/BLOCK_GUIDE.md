# Block Development Guide

This guide provides conventions and best practices for developing blocks in this AEM Edge Delivery Services (EDS) project. Adhering to these guidelines will ensure consistency, maintainability, and optimal performance.

## 1. Block Structure

As outlined in the `ARCHITECTURE.md` file, every block must follow this structure:

- `/blocks/<block-name>/<block-name>.js`
- `/blocks/<block-name>/<block-name>.css`

The `.js` file must export a `default async function decorate(block)` which is the entry point for the block's client-side logic.

## 2. DOM Manipulation

To ensure consistency and efficiency when manipulating the DOM, use the provided helper functions.

### `dom-builder.js`

The project includes a utility file at `/scripts/dom-builder.js` for creating DOM elements programmatically. Always use these helpers instead of `document.createElement()` directly.

**Core Function: `domEl(tag, ...items)`**

- `tag`: The HTML tag to create (e.g., `'div'`).
- `items`: Can be:
    1.  An optional attributes object (e.g., `{ class: 'my-class', 'data-id': '123' }`).
    2.  Child elements (created with `domEl` or other helpers).
    3.  Text content (strings).

**Example:**

```javascript
import { div, h3, p, a } from '../../scripts/dom-builder.js';

const card = div({ class: 'card' },
  h3('My Card'),
  p({ class: 'card-description' }, 'This is a sample card.'),
  p({ class: 'button-container' },
    a({ href: '/path', class: 'button primary' }, 'Read More'),
  ),
);
block.append(card);
```

**Available Helpers:**

The `dom-builder.js` file provides shorthand functions for most common HTML tags: `div`, `p`, `a`, `h1`-`h6`, `ul`, `li`, `img`, `span`, etc. Use them to make your code more readable.

### `aem.js` Utilities

The main `/scripts/aem.js` file exports several utility functions that should be used for common tasks.

- **`createOptimizedPicture(src, alt, eager, breakpoints)`**: Use this to create responsive `<picture>` elements for images. It automatically handles WebP conversion and multiple resolutions.
- **`decorateIcons(element)`**: Call this to transform `span.icon.icon-name` elements into `<img>` tags pointing to the corresponding SVG file in `/icons/`.
- **`decorateButtons(element)`**: Automatically styles links that are the sole content of a paragraph as buttons.
- **`readBlockConfig(block)`**: Reads configuration from a "config" table within a block's content in Google Docs.
- **`wrapTextNodes(block)`**: Ensures that loose text in a block's cell is wrapped in a `<p>` tag for consistent styling.

## 3. CSS Naming Conventions

Follow a BEM-like (Block, Element, Modifier) naming convention for CSS classes to avoid style conflicts and improve readability.

- **Block**: The root class name should match the block's name.
  - Example: `.hero` for the `hero` block.
- **Element**: Descendant elements within the block are denoted with two underscores (`__`).
  - Example: `.hero__title`, `.hero__image`.
- **Modifier**: Variations of a block or element are denoted with two hyphens (`--`).
  - Example: `.hero--large`, `.button--secondary`.

The block's wrapper element, automatically created by EDS, will have a class like `<block-name>-wrapper`. The section containing the block will have a class `<block-name>-container`.

**Example: `cards` block CSS**

```css
/* /blocks/cards/cards.css */

.cards-wrapper {
  /* Styles for the wrapper */
}

.cards {
  /* Styles for the block root */
  display: grid;
  gap: 1rem;
}

.cards .card {
  /* Element: A single card */
  border: 1px solid #ccc;
}

.cards .card__image {
  /* Element: Image within a card */
  width: 100%;
}

.cards .card__caption {
  /* Element: Caption within a card */
  padding: 1rem;
}

/* Modifier for a 'highlight' variant */
.cards.highlight .card {
  background-color: yellow;
}
```

## 4. Performance Constraints & Best Practices

Performance is critical. All blocks must be developed with performance as a primary consideration.

### Lighthouse Targets

Aim for the following Lighthouse scores for all pages:

- **Performance**: 100
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Key Performance Rules

1.  **Lazy Load by Default**: All images and iframes must be lazy-loaded unless they are "above the fold" (visible in the initial viewport). The `createOptimizedPicture` helper lazy-loads images by default.
2.  **Asynchronous Operations**: All block decoration logic in `decorate(block)` must be `async`. Any I/O operations (like `fetch`) must use `await`.
3.  **Minimize DOM Manipulation**: Batch DOM reads and writes. Avoid layout thrashing by not interleaving reads (like `element.offsetWidth`) and writes (like `element.style.width = ...`).
4.  **No Large Libraries**: Do not add heavy third-party libraries (like jQuery, Lodash, or large UI frameworks) to the project. Use native browser APIs and the provided helpers. If a library is absolutely necessary, it must be loaded asynchronously and only when needed.
5.  **CSS over JS**: Prefer CSS for animations and layout (e.g., Flexbox, Grid) over JavaScript-based manipulation where possible.
6.  **Efficient Selectors**: In JavaScript, use specific and efficient DOM selectors. `block.querySelector()` is preferred over `document.querySelector()` to scope searches.
7.  **Event Listeners**: Add event listeners judiciously. Use event delegation where possible (adding one listener to a parent element instead of many to children). Clean up event listeners if a block is removed or re-rendered to prevent memory leaks.

## 5. Code Examples from Existing Blocks

### Example: `header.js`

The `header.js` block demonstrates several best practices:

- **Loading Fragments**: It uses `loadFragment()` to fetch the navigation content from a separate document, which is great for content reuse.
- **Responsive Logic**: It uses `window.matchMedia()` to apply different behaviors for mobile and desktop views, a clean way to handle responsive design in JS.
- **Accessibility**: It correctly manages `aria-*` attributes (e.g., `aria-expanded`, `aria-controls`) and keyboard navigation (e.g., `closeOnEscape`).
- **Event Handling**: It uses `pointerenter` and `pointerleave` with a timeout for hover effects, a common pattern for mega-menus.

By following these guidelines, you will help maintain a clean, performant, and scalable codebase.
