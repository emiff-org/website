# Content Model Guide

This document explains how content authored in Google Docs is structured and interpreted by the AEM Edge Delivery Services (EDS) pipeline for this project. Understanding these conventions is crucial for both content authors and developers.

## Core Concepts

The content pipeline transforms a linear Google Doc into a structured HTML page composed of "sections" and "blocks."

### Sections

- **Definition**: A section is a top-level container in the `<body>` of the page.
- **Creation**: Sections are created by inserting a horizontal rule (`---`) in the Google Doc. All content between two horizontal rules (or between the start/end of the document and a rule) belongs to one section.
- **HTML Output**: Each section is rendered as a `<div>` element directly inside the `<body>`.
- **Styling**: You can add styling to a section by adding metadata to it. This is done by adding a "Section Metadata" table below the content of the section. For example, to add a background color, you can create a table like this:

| Section Metadata |      |
| ---------------- | ---- |
| Style            | Blue |

This will add the class `blue` to the section's `<div>`, allowing for targeted CSS styling.

### Blocks

- **Definition**: Blocks are the primary components for building pages. They are reusable UI elements with specific functionality and styling (e.g., Hero, Cards, Carousel).
- **Creation**: A block is created by inserting a table in the Google Doc. The first row of the table must contain the block's name in the format `Block Name (variant)`.
  - The `Block Name` must match the name of a block in the `/blocks/` directory (e.g., `Cards`, `Hero`).
  - The `(variant)` is optional and adds a CSS class to the block's element, allowing for different styles (e.g., `Cards (highlight)` adds the `highlight` class).
- **Content**: The rows below the header provide the content for the block. Each cell (`<td>`) in the table is passed to the block's `decorate()` function. The block's JavaScript is responsible for interpreting this content and rendering the final HTML.

## Content Mapping Example

Here is an example of how a Google Doc structure is mapped to the final HTML output.

### 1. Sample Google Doc Structure

```
# My Page Title

This is the introductory paragraph.

---

Cards (Highlight)
| Image                  | Text                  |
| ---------------------- | --------------------- |
| [Image of a cat]       | Card 1: A cute cat.   |
| [Image of a dog]       | Card 2: A happy dog.  |

---

Section Metadata
| Style | Dark Background |
| ----- | --------------- |
```

### 2. Intermediate HTML (Sent to Browser)

The EDS pipeline converts the above document into the following simplified HTML structure:

```html
<body>
  <div><!-- Section 1 -->
    <h1>My Page Title</h1>
    <p>This is the introductory paragraph.</p>
  </div>

  <div><!-- Section 2 -->
    <div class="cards highlight">
      <div>
        <div><img src="..." alt=""></div>
        <div>Card 1: A cute cat.</div>
      </div>
      <div>
        <div><img src="..." alt=""></div>
        <div>Card 2: A happy dog.</div>
      </div>
    </div>
  </div>

  <div class="dark-background"><!-- Section 3 from metadata -->
    <!-- This section would contain any content that followed the metadata table -->
  </div>
</body>
```

### 3. Final Rendered Site (After JavaScript Decoration)

The `/blocks/cards/cards.js` script runs, transforming the raw table structure into the final styled component.

```html
<!-- ... inside Section 2 ... -->
<div class="cards highlight">
  <div class="card">
    <div class="card__image">
      <picture>
        <source type="image/webp" srcset="...">
        <img src="..." alt="Card 1: A cute cat.">
      </picture>
    </div>
    <div class="card__caption">
      <h3>Card 1: A cute cat.</h3>
    </div>
  </div>
  <div class="card">
    <div class="card__image">
      <picture>
        <source type="image/webp" srcset="...">
        <img src="..." alt="Card 2: A happy dog.">
      </picture>
    </div>
    <div class="card__caption">
      <h3>Card 2: A happy dog.</h3>
    </div>
  </div>
</div>
```

## Metadata

- **Page Metadata**: To control page-level information (like the `title` tag, `description`, or theme), a "Metadata" table can be added at the top of the document.

  | Metadata      |               |
  | ------------- | ------------- |
  | Title         | My Custom Title |
  | Description   | A great page. |
  | Theme         | Dark          |

- **Section Metadata**: As shown above, this table modifies the section that contains it.

## Links and Images

- **Links**: Internal links should be created using relative paths (e.g., `/path/to/page`). External links should be fully qualified (e.g., `https://example.com`).
- **Images**: Images are added directly into the Google Doc. The pipeline optimizes them and serves them from the CDN. Alt text is automatically derived from the image's filename or surrounding text, but can be explicitly set in the Google Doc.
