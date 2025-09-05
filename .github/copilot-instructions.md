# GitHub Copilot Instructions

## Purpose
This repository is an **Adobe Edge Delivery Service (EDS) project** for a film festival website. All content originates from Google Docs. The codebase uses **pure JavaScript and EDS Blocks** for UI components. No third-party libraries or frameworks are allowed.

## Context to Always Load
When generating, editing, or reviewing code, always consult these documentation files in the root of the repo:

- `ARCHITECTURE.md` — explains repo structure, build/preview workflow, and content pipeline.  
- `BLOCKS_GUIDE.md` — rules for creating and updating EDS blocks (naming, file layout, init pattern, CSS scoping, accessibility, performance).  
- `CONTENT_MODEL.md` — how Google Docs content is mapped into sections, metadata, and blocks.  
- `STYLE_GUIDE.md` — JavaScript and CSS style conventions, accessibility requirements, and performance budgets.

## General Rules for Copilot
- Do **not** suggest adding external libraries, frameworks, or build tooling.  
- Follow the conventions in `BLOCKS_GUIDE.md` when writing or editing block code.  
- Keep CSS scoped to the block root element. Avoid global styles.  
- Prefer small, composable functions and ESM syntax.  
- Write code that passes linting and matches the repo’s style guide.  
- When unsure about implementation details, check the existing blocks in `/blocks/` for patterns.  
- For Google Docs transformations, follow the content conventions in `CONTENT_MODEL.md`.  

## Output Expectations
- Provide **minimal diffs** to the relevant file(s).  
- Include **short test instructions** (how to verify locally in Franklin preview).  
- Add **inline comments** only when non-obvious logic is introduced.  
- For accessibility or performance work, explain rationale in a short note.  

---

These instructions are meant to guide GitHub Copilot across the entire repo. They apply to both Copilot Chat and inline code completions.