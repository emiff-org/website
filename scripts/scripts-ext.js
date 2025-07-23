import { fetchPlaceholders } from './aem.js';
import { getLocale } from './i18n-utils.js';

/**
 * Enhances <img> elements inside <p> tags by applying adjacent text nodes as alt attributes.
 * Only modifies images that do not already have an alt.
 * @param {Element} main The root container (usually <main>)
 */
export function addImgAltText(main) {
  main.querySelectorAll('img').forEach((img) => {
    if (img.alt) return;

    const parent = img.closest('p');
    if (!parent) return;

    const next = img.nextSibling;
    if (
      next?.nodeType === Node.TEXT_NODE
      && next.textContent.trim()
    ) {
      img.alt = next.textContent.trim();
      next.remove(); // Optional: clean up caption visually
    }
  });
}

/**
 * Checks for all images that are links without text
 * and adds the alt text of the image as aria-label to the link.
 * Also resolves odd EDS artefact of empty but spammy link titles.
 * @param {Element} main The root container (usually <main>)
 */
export function addLinkAltFromImageText(main) {
  main.querySelectorAll('a').forEach((link) => {
    const img = link.querySelector('img');
    const hasText = link.textContent.trim().length > 0;

    if (img && !hasText && !link.hasAttribute('aria-label')) {
      const alt = img.getAttribute('alt')?.trim();
      if (alt) {
        link.setAttribute('aria-label', alt);
      } else if (link.title?.trim()) {
        link.setAttribute('aria-label', link.title.trim());
      }
      link.title = ''; // Clear title to avoid spammy tooltips
    }
  });
}

export async function fetchLocalPlaceholders() {
  const language = getLocale();
  const placeholders = await fetchPlaceholders(`/${language}`);
  return placeholders;
}
