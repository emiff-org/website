import { getMetadata } from './aem.js';

export const defaultLanguage = 'en';

/**
 * Retrieves the locale setting for the application. It first checks the
 * 'data-language' attribute of the document's root element. If not found,
 * it falls back to metadata with the key 'og:locale'. If neither is defined,
 * it returns a default locale constructed from the default language and country.
 *
 * @return {string} The locale identifier in the format language_country (e.g., en_US).
 */
export function getLocale() {
  const docLocale = document.documentElement.getAttribute('data-language') || getMetadata('og:locale');
  return docLocale ?? `${defaultLanguage}`;
}
