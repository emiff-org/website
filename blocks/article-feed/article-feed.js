import { renderBlock } from '../../scripts/faintly.js';
import { readBlockConfig } from '../../scripts/aem.js';
import getIndexPath from '../../scripts/index-utils.js';
import ffetch from '../../scripts/ffetch.js';
import { parseDateTime } from '../../scripts/components-utils.js';

function fetchArticlesFactory(block) {
  return async function fetchArticles() {
    const config = readBlockConfig(block);
    const limit = parseInt(config?.limit ?? '', 10) || undefined;
    const type = config?.type?.trim().toLowerCase();
    const index = config?.index?.trim().toUpperCase();

    const rawEntries = await ffetch(getIndexPath(`INDEX_${index}`)).all();
    const entries = rawEntries
      .filter((entry) => entry.type.toLowerCase() === type)
      .sort((a, b) => {
        const dateTimeA = parseDateTime(a.publicationDate);
        const dateTimeB = parseDateTime(b.publicationDate);
        return dateTimeB - dateTimeA;
      })
      .slice(0, Number.isNaN(limit) ? undefined : limit);
    entries.forEach((entry) => {
      if (entry.path) {
        entry.url = entry.path;
      }
    });
    return entries;
  };
}

export default async function decorate(block) {
  const fetchArticles = fetchArticlesFactory(block);

  await renderBlock(block, {
    fetchArticles,
    isFeaturedArticle: (context) => context.article.featured,
    articleLinkAttrs: (context) => ({
      href: context.article.path,
      title: context.article.title,
    }),
  });
}
