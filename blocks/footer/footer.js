import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Inlines an external SVG by replacing the <img> tag with the inline <svg>
 * @param {HTMLImageElement} img 
 */
async function inlineSvg(img) {
  try {
    const src = img.getAttribute('src');
    const response = await fetch(src);
    if (!response.ok) throw new Error(`Failed to fetch ${src}`);
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    if (!svgElement) throw new Error('Invalid SVG content');

    // Copy over alt text if needed
    const alt = img.getAttribute('alt');
    if (alt) svgElement.setAttribute('aria-label', alt);
    svgElement.setAttribute('role', 'img');
    svgElement.setAttribute('focusable', 'false');
    svgElement.setAttribute('fill', 'currentColor'); // Make fill stylable via CSS

    img.replaceWith(svgElement);
  } catch (err) {
    console.warn('SVG inlining failed:', img.src, err);
  }
}

/**
 * Loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // Clear and re-append fragment content
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  block.append(footer);

  // Inline all SVGs in the footer
  const svgImages = footer.querySelectorAll('img[src$=".svg"]');
  await Promise.all([...svgImages].map(inlineSvg));
}