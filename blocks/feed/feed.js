import getIndexPath from '../../scripts/index-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';
import {
  createCustomSelect,
  parseDateTime,
  getIcon,
  getCSFilterMap,
  getFiltersKvMap,
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
    .sort((a, b) => {
      const dateA = parseInt(a.publicationDate || '0', 10);
      const dateB = parseInt(b.publicationDate || '0', 10);
      return dateA - dateB;
    });
}

async function fetchItems(config) {
  const index = config?.index?.trim().toUpperCase();
  const items = await ffetch(getIndexPath(`INDEX_${index}`)).all();
  return items;
}

function renderCardItems(itemsToRender, container, limit) {
  const ul = document.createElement('ul');

  itemsToRender.slice(0, limit).forEach((loc) => {
    const li = document.createElement('li');

    // Image section
    const imageDiv = document.createElement('div');
    imageDiv.className = 'cards-card-image';

    const pImage = document.createElement('p');
    const aImage = document.createElement('a');
    aImage.href = loc.path;
    aImage.setAttribute('aria-label', loc.title);
    aImage.title = '';

    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = loc.title;
    img.src = loc.image;

    picture.appendChild(img);
    aImage.appendChild(picture);
    pImage.appendChild(aImage);
    imageDiv.appendChild(pImage);

    // Text content section
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';

    if (loc.events) {
      const pSub = document.createElement('p');
      pSub.className = 'cards-card-subtitle';
      pSub.textContent = loc.events;
      bodyDiv.appendChild(pSub);
    }

    const h3 = document.createElement('h3');
    h3.id = loc.title.toLowerCase().replace(/\s+/g, '-');
    const aTitle = document.createElement('a');
    aTitle.href = loc.path;
    aTitle.title = loc.title;
    aTitle.textContent = loc.title;
    h3.appendChild(aTitle);
    bodyDiv.appendChild(h3);

    if (loc.description) {
      const pDescr = document.createElement('p');
      loc.description.split(',').forEach((part, idx) => {
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

function renderListItems(itemsToRender, container, limit) {
  container.innerHTML = ''; // Clear previous items

  itemsToRender.slice(0, limit).forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('feed-item');

    const subtitle = item.publication ?? item.category;
    if (subtitle) {
      const pSub = document.createElement('p');
      pSub.classList.add('feed-item-subtitle');
      pSub.textContent = subtitle;
      div.append(pSub);
    }

    const h3 = document.createElement('h3');
    h3.classList.add('feed-item-title');
    const href = item.path ?? item.url;
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = item.title;
      // external links should open in new window
      const url = new URL(href, window.location.href);
      if (url.hostname !== window.location.hostname) {
        a.target = '_blank';
      }
      h3.append(a);
    } else {
      h3.textContent = item.title;
    }
    div.append(h3);

    if (item.description) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = item.description;
      div.append(pDescr);
    }
    container.append(div);
  });
  return container;
}

function renderFeed(items, layout, limit) {
  const container = document.createElement('div');

  if (layout === 'cards') {
    container.classList.add('cards', 'block');
    renderCardItems(items, container, limit);
  } else {
    container.classList.add('feed');
    renderListItems(items, container, limit);
  }
  return container;
}

function renderControls(filters, items, layout, hideFilters) {
  const container = document.createElement('div');
  container.classList.add('custom-select-flex');

  filters.entries().forEach(([key, value]) => {
    if (hideFilters.includes(key)) return; // skip hidden filters
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
      value,
    );
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

  const items = await fetchItems(config);
  const filteredItems = filterItems(items, filters);

  block.textContent = '';

  // accepted layouts: feed, cards
  const layout = config?.layout?.trim().toLowerCase();
  if (!Array.isArray(filters) || filters.length !== 0) {
    block.append(renderControls(filters, items, layout, hideFilters));
  }
  block.append(renderFeed(filteredItems, layout, limit));
}
