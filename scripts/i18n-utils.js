const defaultLanguage = 'en';

/**
 * Retrieves the locale setting for the application. It first checks any supported language
 * in the URL. If not found, it returns the defined default language.
 *
 * @return {string} The locale language identifier.
 */
export function getLocale() {
  const urlLocale = window.location.pathname.split('/')[1];
  const supportedLocales = ['en', 'es'];

  if (supportedLocales.includes(urlLocale)) {
    return urlLocale;
  }
  return defaultLanguage;
}
