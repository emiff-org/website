# Architecture

This document outlines the architecture of the AEM Edge Delivery Services (EDS), also known as Franklin, project. It is intended to guide development and ensure consistency across the codebase, particularly for AI-assisted development.

## Overview

This project is built on AEM Edge Delivery Services, a modern web development architecture that uses familiar tools like Google Docs and Microsoft Word for content authoring and delivers content through a high-performance edge network. The core principle is to separate content from code, allowing for rapid development and content updates.

- **Content Source**: Content is authored in Google Docs.
- **Code Repository**: The code, including styles, scripts, and block components, is managed in this GitHub repository.
- **Publishing**: AEM's publishing pipeline (Helix) fetches content from Google Docs, combines it with the code from this repository, and generates the final HTML, which is then served via a CDN.

## Project Structure

The project follows a standard EDS structure:

```
/
├── blocks/                   # Reusable components (blocks)
├── fonts/                    # Web fonts
├── icons/                    # SVG icons
├── scripts/                  # Global JavaScript
├── styles/                   # Global CSS
├── tools/                    # Developer tools (e.g., for bulk reindexing)
├── 404.html                  # Custom 404 page
├── fstab.yaml                # Mountpoints for content sources (e.g., Google Drive)
├── head.html                 # Defines the content of the <head> element for all pages
├── helix-query.yaml          # Configuration for custom content queries (e.g., for feeds)
├── helix-sitemap.yaml        # Sitemap generation configuration
└── package.json              # Project dependencies and scripts
```

### Key Files

- **`fstab.yaml`**: The "Filesystem Table" maps content sources (like a Google Drive folder) to a path on the website. This is how the project knows where to find the content documents.
- **`head.html`**: Contains the static part of the HTML `<head>` section, including default meta tags, favicon links, and references to global stylesheets and scripts.
- **`helix-*.yaml`**: These files configure the behavior of the Edge Delivery Services pipeline. For example, `helix-query.yaml` is used to define custom APIs for things like article feeds.
- **`scripts/aem.js`**: The main entry point for the site's JavaScript. It handles the loading of blocks, fonts, and other dynamic functionality.
- **`styles/styles.css`**: The main stylesheet for the site. It contains global styles and imports other CSS files.

## Blocks

Blocks are the primary building blocks of pages. They are reusable components that encapsulate specific functionality and styling.

### Block Structure

Each block resides in its own directory within `/blocks/`. The structure is as follows:

- `/blocks/<block-name>/<block-name>.css`: Styles specific to the block. These are automatically loaded when the block appears on a page.
- `/blocks/<block-name>/<block-name>.js`: The JavaScript logic for the block. This file must export a default function that takes the block's DOM element as an argument. This function is responsible for decorating the block and adding any dynamic behavior.

**Example: A `hero` block**

```
/blocks/
└── hero/
    ├── hero.css
    └── hero.js
```

The `hero.js` file would look something like this:

```javascript
export default function decorate(block) {
  // Logic to transform the raw content into the final hero structure
  // e.g., moving images, adding classes, etc.
}
```

## Content Authoring in Google Docs

Pages are authored as documents in Google Docs. The structure of the document directly maps to the structure of the web page.

### Sections

A page is divided into horizontal sections. In Google Docs, a section is created by inserting a horizontal rule (`---`). Each section can have its own styling and can contain default content or blocks.

### Metadata (Front Matter)

Page-level metadata is defined in a "Metadata" block, which is a two-column table at the very top of the document.

| Metadata      |               |
|---------------|---------------|
| Title         | My Page Title |
| Description   | A description |
| Template      | Article       |
| Author        | John Doe      |

- **`Title` & `Description`**: Used for the corresponding `<title>` and `<meta name="description">` tags in the HTML head.
- **`Template`**: Applies a specific body class to the page (e.g., `article-template`), allowing for template-level styling.
- Other key-value pairs can be added as needed for custom logic.

### Default Content

Any content that is not part of a block is considered "default content". This includes paragraphs, headings, lists, and images. The system automatically converts this content into the appropriate HTML tags.

### Blocks in Content

Blocks are defined in the content using tables. The first row of the table specifies the block's name. The subsequent rows contain the content for that block.

**Example: A `cards` block**

| cards     |          |
|-----------|----------|
| (image)   | Card 1   |
| (image)   | Card 2   |
| (image)   | Card 3   |

When the page is rendered, the system will find the `/blocks/cards/` directory, load `cards.css` and `cards.js`, and execute the `decorate` function in the JS file on the HTML generated from this table.

Block names can also include variants, which are passed as classes to the block's element.

**Example: A `columns (highlight)` block**

| columns (highlight) |          |
|---------------------|----------|
| Column 1 content    | Column 2 |

This will create a columns block with the `highlight` class, which can be used for styling variations.
