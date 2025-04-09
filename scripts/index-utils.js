import { getLocale } from './i18n-utils.js';

export const INDEX_ALL = 'query-index';
export const INDEX_NEWS = 'query-index';

/**
 * Retrieves the path for a specified index, optionally including a country-specific prefix.
 *
 * @param {string} index - The name of the index for which the path is retrieved.
 * @return {string} The constructed path for the given index. If a country is detected,
 * it includes a country-specific prefix; otherwise, it defaults to a general path.
 */
export function getIndexPath(index) {
  const language = getLocale();
  return (language !== '')
    ? `${window.hlx.codeBasePath}/${language}/${index}.json`
    : `${window.hlx.codeBasePath}/${index}.json`;
}
