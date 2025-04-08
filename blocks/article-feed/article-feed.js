import { renderBlock } from '../../scripts/faintly.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { getIndexPath, INDEX_NEWS } from '../../scripts/index-utils.js';

async function fetchArticles() {
  const response = await fetch(getIndexPath(INDEX_NEWS));
  const json = await response.json();

  return json.data;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  console.log(`news feed block config: ${JSON.stringify(config)}`);

  await renderBlock(block, {
    fetchArticles,
    isFeaturedArticle: (context) => context.article.featured,
    articleLinkAttrs: (context) => ({
      href: context.article.path,
      title: context.article.title,
    }),
  });
}