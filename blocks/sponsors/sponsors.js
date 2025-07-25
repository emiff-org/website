import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getLocale } from '../../scripts/i18n-utils.js';

/**
 * Loads and decorates the sponsors
 * @param {Element} block The sponsors block element
 */
export default async function decorate(block) {
  const sponsorsMeta = getMetadata('sponsors');
  const language = getLocale();
  const sponsorsPath = sponsorsMeta ? new URL(sponsorsMeta, window.location).pathname : `/${language}/sponsors`;
  const fragment = await loadFragment(sponsorsPath);

  // Clear and re-append fragment content
  block.textContent = '';
  const sponsors = document.createElement('div');
  while (fragment.firstElementChild) sponsors.append(fragment.firstElementChild);
  block.append(sponsors);
}
