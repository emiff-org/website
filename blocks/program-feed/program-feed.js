import getIndexPath from '../../scripts/index-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';
import {
  createCustomSelect,
  parseDateTime,
  getIcon,
  getCSFilterMap,
  getFiltersKvMap,
  getOrdinal,
  formatDateVerbose,
} from '../../scripts/components-utils.js';
import ffetch from '../../scripts/ffetch.js';

function renderCardItems(itemsToRender, limit, container) {
  const ul = document.createElement('ul');

  itemsToRender.slice(0, limit).forEach((item) => {
    const li = document.createElement('li');

    // Image section
    const imageDiv = document.createElement('div');
    imageDiv.className = 'cards-card-image';

    const pImage = document.createElement('p');
    const aImage = document.createElement('a');
    aImage.href = item.path;
    aImage.setAttribute('aria-label', item.title);
    aImage.title = '';

    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = item.title;
    img.src = item.image;

    picture.appendChild(img);
    aImage.appendChild(picture);
    pImage.appendChild(aImage);
    imageDiv.appendChild(pImage);

    // Text content section
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';

    if (item.events) {
      const pSub = document.createElement('p');
      pSub.className = 'cards-card-subtitle';
      pSub.textContent = item.events;
      bodyDiv.appendChild(pSub);
    }

    const h3 = document.createElement('h3');
    h3.id = item.title.toLowerCase().replace(/\s+/g, '-');
    const aTitle = document.createElement('a');
    aTitle.href = item.path;
    aTitle.title = item.title;
    aTitle.textContent = item.title;
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

    const divMeta = document.createElement('div');
    if (item.credits) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('group'));
      sEl.append(item.credits);
      divMeta.append(sEl);
    }
    if (item.time) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('clock'));
      sEl.append(item.time);
      divMeta.append(sEl);
    }
    if (item.location) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('pin'));
      const pTitle = document.createElement('a');
      pTitle.href = item.locationPath;
      pTitle.title = item.location;
      pTitle.textContent = item.location;
      sEl.appendChild(pTitle);
      divMeta.append(sEl);
    }
    bodyDiv.appendChild(divMeta);

    li.appendChild(imageDiv);
    li.appendChild(bodyDiv);
    ul.appendChild(li);
  });

  container.innerHTML = ''; // Clear previous content
  container.appendChild(ul);
  return container;
}

function renderListItems(itemsToRender, limit, container) {
  container.innerHTML = ''; // Clear previous items

  itemsToRender.slice(0, limit).forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('feed-item');
    if (item.type) div.classList.add(item.type.toLowerCase());

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
      h3.append(a);
    } else {
      h3.textContent = item.title;
    }
    const spanDate = document.createElement('span');
    spanDate.classList.add('feed-item-date');
    const date = parseDateTime(item.date, item.time);
    spanDate.textContent = formatDateVerbose(date);

    const divHeader = document.createElement('div');
    divHeader.classList.add('feed-item-header', item.type.toLowerCase());
    divHeader.append(h3);
    divHeader.append(spanDate);
    div.append(divHeader);

    const divBody = document.createElement('div');
    divBody.classList.add('feed-item-body');

    if (item.image) {
      const divImg = document.createElement('div');
      divImg.classList.add('feed-item-image');
      const pDescr = document.createElement('img');
      pDescr.src = item.image;
      divImg.append(pDescr);
      divBody.append(divImg);
      if (item.section) {
        const pSection = document.createElement('p');
        pSection.classList.add('feed-item-section');
        pSection.textContent = item.section;
        divImg.append(pSection);
      }
    }
    const divInfo = document.createElement('div');
    divInfo.classList.add('feed-item-info');
    if (item.description) {
      const divDescr = document.createElement('div');
      divDescr.classList.add('feed-item-description');
      const sEl = document.createElement('span');
      sEl.textContent = item.description;
      divDescr.append(sEl);
      divInfo.append(divDescr);
    }
    const divMeta = document.createElement('div');
    divMeta.classList.add('feed-item-meta');
    if (item.credits) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('group'));
      sEl.append(item.credits);
      divMeta.append(sEl);
    }
    if (item.time) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('clock'));
      sEl.append(item.time);
      divMeta.append(sEl);
    }
    if (item.location) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('pin'));
      const pTitle = document.createElement('a');
      pTitle.href = item.locationPath;
      pTitle.title = item.location;
      pTitle.textContent = item.location;
      sEl.appendChild(pTitle);
      divMeta.append(sEl);
    }
    if (item.languages) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('flag'));
      sEl.append(item.languages);
      divMeta.append(sEl);
    }
    if (item.country) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('globe'));
      sEl.append(item.country);
      divMeta.append(sEl);
    }
    if (item.ticket) {
      const sEl = document.createElement('span');
      sEl.appendChild(getIcon('card'));
      const aEl = document.createElement('a');
      aEl.href = item.ticket;
      aEl.title = 'Ticket';
      aEl.textContent = 'Ticket';
      sEl.appendChild(aEl);
      divMeta.append(sEl);
    }
    divInfo.append(divMeta);
    divBody.append(divInfo);
    div.append(divBody);
    container.append(div);
  });
  return container;
}

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
      const dateTimeA = parseDateTime(a.date, a.time);
      const dateTimeB = parseDateTime(b.date, b.time);
      return dateTimeA - dateTimeB;
    });
}

async function fetchItems() {
  const [programData, entriesData, blocksData, eventsData, locationsData] = await Promise.all([
    ffetch(getIndexPath('INDEX_PROGRAM')).all(),
    ffetch(getIndexPath('INDEX_ENTRIES')).all(),
    ffetch(getIndexPath('INDEX_BLOCKS')).all(),
    ffetch(getIndexPath('INDEX_EVENTS')).all(),
    ffetch(getIndexPath('INDEX_LOCATIONS')).all(),
  ]);

  const items = programData.map((item) => {
    const entry = entriesData.find(
      (e) => e.title.toLowerCase() === item.title.toLowerCase(),
    );
    const block = blocksData.find(
      (b) => b.title.toLowerCase() === item.title.toLowerCase(),
    );
    const event = eventsData.find(
      (e) => e.title.toLowerCase() === item.title.toLowerCase(),
    );
    const location = locationsData.find(
      (l) => l.title.toLowerCase() === item.location.toLowerCase(),
    );

    return {
      ...item,
      path: entry?.path || block?.path || event?.path || '',
      title: entry?.title || block?.title || event?.title || 'Entry not found!',
      type: entry?.type || block?.type || event?.type || '',
      image: entry?.image || block?.image || event?.image || '',
      credits: entry?.credits || block?.credits || event?.credits || '',
      description: entry?.description || block?.description || event?.description || '',
      country: entry?.country || block?.country || event?.country || '',
      genre: entry?.genre || '',
      languages: entry?.languages || block?.languages || event?.languages || '',
      section: entry?.section || '',
      locationMap: location?.map || '',
      locationPath: location?.path || '',
    };
  });
  return items;
}

function renderFeed(items, layout, limit) {
  const container = document.createElement('div');
  if (layout === 'cards') {
    container.classList.add('cards', 'block', 'feed');
    renderCardItems(items, limit, container);
  } else {
    container.classList.add('feed');
    renderListItems(items, limit, container);
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
        const parentBlock = select.closest('.program-feed');
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
  block.innerHTML = '';

  // filters are configured with comma separated key list
  const filterValue = config?.filter?.trim();
  const filters = getFiltersKvMap(filterValue);
  const hideFiltersValue = config?.hidefilters?.trim();
  const hideFilters = hideFiltersValue ? hideFiltersValue.split(',').map((val) => val.trim()) : [];
  const limit = config?.limit?.trim().toLowerCase();
  const items = await fetchItems();
  const filteredItems = filterItems(items, filters);

  // accepted layouts: feed, cards
  const layout = config?.layout?.trim().toLowerCase();
  if (!Array.isArray(filters) || filters.length !== 0) {
    block.append(renderControls(filters, items, layout, hideFilters));
  }
  block.append(renderFeed(filteredItems, layout, limit));
}
