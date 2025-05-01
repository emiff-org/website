import { renderBlock } from '../../scripts/faintly.js';
import { readBlockConfig } from '../../scripts/aem.js';
import getIndexPath from '../../scripts/index-utils.js';
import ffetch from '../../scripts/ffetch.js';

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
        const dateA = parseInt(a.publicationDate || '0', 10);
        const dateB = parseInt(b.publicationDate || '0', 10);
        return dateB - dateA; // descending
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
