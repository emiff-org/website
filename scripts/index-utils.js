import { getLocale } from './i18n-utils.js';

const INDEX_PATHS = {
  INDEX_ALL: 'query-index',
  INDEX_NEWS: 'query-index',
  INDEX_MENTIONS: 'news/mentions-index',
  INDEX_LOCATIONS: 'locations-index',
  INDEX_ENTRIES: 'program/entries-index',
  INDEX_PROGRAM: 'program/program-index',
  INDEX_BLOCKS: 'program/blocks-index',
  INDEX_EVENTS: 'program/events-index',
};

/**
 * Retrieves the path for a specified index, optionally including a country-specific prefix.
 *
 * @param {string} index - The name of the index for which the path is retrieved.
 * @return {string} The constructed path for the given index. If a country is detected,
 * it includes a country-specific prefix; otherwise, it defaults to a general path.
 */
function getIndexPath(index) {
  const language = getLocale();
  return (language !== '')
    ? `${window.hlx.codeBasePath}/${language}/${INDEX_PATHS[index]}.json`
    : `${window.hlx.codeBasePath}/${INDEX_PATHS[index]}.json`;
}

export default getIndexPath;
