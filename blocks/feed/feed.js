import getIndexPath from '../../scripts/index-utils.js';
import { fetchLocalPlaceholders } from '../../scripts/scripts-ext.js';
import ffetch from '../../scripts/ffetch.js';
import { readBlockConfig } from '../../scripts/aem.js';
import {
  getHref,
  getHostname,
} from '../../scripts/scripts.js';
import {
  createCustomSelect,
  formatDateVerbose,
  getCSFilterMap,
  getFiltersKvMap,
  parseDateTime,
} from '../../scripts/components-utils.js';

// expects a map with kv pairs as filter
function filterItems(items, filters) {
  const filteredItems = (filters.length === 0) ? items : items.filter((item) => filters.entries()
    .every(([key, value]) => {
      if (value.length === 0 || value.toLowerCase().startsWith('all ')) return true;
      const itemValue = item[key.toLowerCase()]?.toString().toLowerCase().trim();
      const filterValue = value.toString().toLowerCase().trim();
      return itemValue === filterValue;
    }));
  return filteredItems
    .sort((a, b) => b.publicationDate - a.publicationDate);
}

async function fetchItems(config) {
  const index = config?.index?.trim().toUpperCase();
  const items = await ffetch(getIndexPath(`INDEX_${index}`)).all();
  items.forEach((item) => {
    item.publicationDate = item.publicationDate ? parseDateTime(item.publicationDate) : '';
  });
  return items;
}

function renderCardItems(itemsToRender, container, limit) {
  const ul = document.createElement('ul');

  itemsToRender.slice(0, limit).forEach((item) => {
    const li = document.createElement('li');

    // Image section
    const imageDiv = document.createElement('div');
    imageDiv.className = 'cards-card-image';

    const pImage = document.createElement('p');
    const aImage = document.createElement('a');
    aImage.href = item.path;
    const itemTitle = item.title || 'Untitled';
    aImage.setAttribute('aria-label', itemTitle);
    aImage.title = '';

    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = itemTitle;
    img.src = item.image || '';

    picture.appendChild(img);
    aImage.appendChild(picture);
    pImage.appendChild(aImage);
    imageDiv.appendChild(pImage);

    // Text content section
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';

    const pSub = document.createElement('p');
    pSub.classList.add('cards-card-subtitle');
    const category = item.category || '';
    const date = item.publicationDate ? formatDateVerbose(item.publicationDate) : '';
    const separator = category && date ? ' - ' : '';
    pSub.textContent = `${category}${separator}${date}`;
    bodyDiv.appendChild(pSub);

    const h3 = document.createElement('h3');
    const cardTitle = item.title || 'Untitled';
    h3.id = cardTitle.toLowerCase().replace(/\s+/g, '-');
    const aTitle = document.createElement('a');
    aTitle.href = item.path;
    aTitle.title = cardTitle;
    aTitle.textContent = cardTitle;
    h3.appendChild(aTitle);
    bodyDiv.appendChild(h3);

    if (item.description) {
      const pDescr = document.createElement('p');
      item.description.split(',').forEach((part, idx) => {
        if (idx > 0) pDescr.appendChild(document.createElement('br'));
        pDescr.appendChild(document.createTextNode(part.trim()));
      });
      bodyDiv.appendChild(pDescr);
    }

    li.appendChild(imageDiv);
    li.appendChild(bodyDiv);
    ul.appendChild(li);
  });

  container.innerHTML = ''; // Clear previous content
  container.appendChild(ul);
  return container;
}

function renderListItems(itemsToRender, container, limit, hideImages = false) {
  container.innerHTML = ''; // Clear previous items

  itemsToRender.slice(0, limit).forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('feed-item');

    // Image section
    if (!hideImages && item.image) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'feed-item-image';

      const aImage = document.createElement('a');
      aImage.href = item.path;
      const listItemTitle = item.title || 'Untitled';
      aImage.setAttribute('aria-label', listItemTitle);
      aImage.title = '';

      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = listItemTitle;
      img.src = item.image;

      picture.appendChild(img);
      aImage.appendChild(picture);
      imageDiv.appendChild(aImage);
      div.appendChild(imageDiv);
    }

    // Body content section
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'feed-item-body';
    const pSub = document.createElement('p');
    pSub.classList.add('feed-item-subtitle');
    const pubCategory = item.category ? `${item.category} - ` : '';
    const pubDate = item.publicationDate ? formatDateVerbose(item.publicationDate) : '';
    pSub.textContent = `${pubCategory}${pubDate}`;
    bodyDiv.append(pSub);

    const h3 = document.createElement('h3');
    h3.classList.add('feed-item-title');
    const href = item.path ?? item.url;
    const itemTitleText = item.title || 'Untitled';
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = itemTitleText;

      // external links should open in new window
      const url = href.startsWith('http') ? new URL(href) : new URL(href, getHref());
      if (url.hostname !== getHostname()) {
        a.target = '_blank';
      }
      h3.append(a);
    } else {
      h3.textContent = itemTitleText;
    }
    bodyDiv.append(h3);

    if (item.description) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('clamp-2');
      pDescr.textContent = item.description;
      bodyDiv.append(pDescr);
    }
    div.appendChild(bodyDiv);
    container.append(div);
  });
  return container;
}

function renderFeed(items, layout, limit, hideImages) {
  const container = document.createElement('div');

  if (layout === 'cards') {
    container.classList.add('cards', 'block');
    renderCardItems(items, container, limit);
  } else {
    container.classList.add('feed');
    renderListItems(items, container, limit, hideImages);
  }
  return container;
}

async function renderControls(filters, items, layout, hideFilters) {
  const placeholders = await fetchLocalPlaceholders();
  const container = document.createElement('div');
  container.classList.add('custom-select-flex');

  filters.entries().forEach(([key, value]) => {
    const selectWrapper = createCustomSelect(
      key,
      items,
      (select) => {
        const parentBlock = select.closest('.feed');
        const compFilter = getCSFilterMap(parentBlock); // get latest filters from UI components
        const filteredItems = filterItems(items, compFilter);
        const feedBlock = renderFeed(filteredItems, layout);
        const oldFeedBlock = parentBlock.querySelector('div.feed');
        if (oldFeedBlock) parentBlock.replaceChild(feedBlock, oldFeedBlock);
        else parentBlock.append(feedBlock);
      },
      placeholders,
      value,
    );
    if (hideFilters.includes(key)) selectWrapper.style.display = 'none';
    container.append(selectWrapper);
  });
  return container;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const filterValue = config?.filter?.trim();
  const filters = getFiltersKvMap(filterValue);
  const hideFiltersValue = config?.hidefilters?.trim();
  const hideFilters = hideFiltersValue ? hideFiltersValue.split(',').map((val) => val.trim()) : [];
  const limit = config?.limit?.trim().toLowerCase();
  const hideImages = (config?.images?.trim().toLowerCase() === 'hide');

  const items = await fetchItems(config);
  const filteredItems = filterItems(items, filters);

  block.textContent = '';

  // accepted layouts: feed, cards
  const layout = config?.layout?.trim().toLowerCase();
  if (!Array.isArray(filters) || filters.length !== 0) {
    block.append(await renderControls(filters, filteredItems, layout, hideFilters));
  }
  block.append(renderFeed(filteredItems, layout, limit, hideImages));
}
