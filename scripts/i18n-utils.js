import { getMetadata } from './aem.js';

export const defaultLanguage = 'en';

/**
 * Retrieves the locale setting for the application. It first checks any supported language
 * in the URL. If not found, it continues with the 'data-language' attribute of the
 * document's root element. If not found, it falls back to metadata with the
 * key 'og:locale'. If neither is defined, it returns a default locale constructed from the
 * default language and country.
 *
 * @return {string} The locale identifier in the format language_country (e.g., en_US).
 */
export function getLocale() {
  const urlLocale = window.location.pathname.split('/')[1]; // first part after domain
  const supportedLocales = ['en', 'es']; // <-- define your supported languages here

  if (supportedLocales.includes(urlLocale)) {
    return urlLocale;
  }

  const docLocale = document.documentElement.getAttribute('data-language') || getMetadata('og:locale');
  return docLocale ?? `${defaultLanguage}`;
}
