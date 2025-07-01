import getIndexPath from '../../scripts/index-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';

function parseDateTime(dateStr, timeStr) {
  // convert '30.10.2024' to '2024-10-30T22:00'
  const [day, month, year] = dateStr.split('.');
  return new Date(`${year}-${month}-${day}T${timeStr || '00:00'}`);
}

function getIcon(name) {
  const sEl = document.createElement('span');
  sEl.classList.add('icon', `icon-${name}`);
  const iEl = document.createElement('img');
  iEl.src = `/icons/icon-${name}.svg`;
  sEl.appendChild(iEl);
  return sEl;
}

async function fetchItems(config) {
  const type = config?.type?.trim().toLowerCase();
  const limit = parseInt(config?.limit ?? '', 10) || undefined;

  const [programData, entriesData, blocksData, eventsData, locationsData] = await Promise.all([
    ffetch(getIndexPath('INDEX_PROGRAM')).all(),
    ffetch(getIndexPath('INDEX_ENTRIES')).all(),
    ffetch(getIndexPath('INDEX_BLOCKS')).all(),
    ffetch(getIndexPath('INDEX_EVENTS')).all(),
    ffetch(getIndexPath('INDEX_LOCATIONS')).all(),
  ]);

  const mergedData = programData.map((item) => {
    const entry = entriesData.find(
      (e) => e.title.toLowerCase() === item.title.toLowerCase(),
    );
    const block = blocksData.find(
      (e) => e.title.toLowerCase() === item.title.toLowerCase(),
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

  return mergedData
    .filter((item) => !type || item.type.toLowerCase() === type)
    .sort((a, b) => {
      const dateTimeA = parseDateTime(a.date, a.time);
      const dateTimeB = parseDateTime(b.date, b.time);
      return dateTimeA - dateTimeB; // descending
    })
    .slice(0, Number.isNaN(limit) ? undefined : limit);
}

function renderCardItems(itemsToRender, container) {
  const ul = document.createElement('ul');

  itemsToRender.forEach((item) => {
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

function renderListItems(itemsToRender, container) {
  container.innerHTML = ''; // Clear previous items

  itemsToRender.forEach((item) => {
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
    const divHeader = document.createElement('div');
    divHeader.classList.add('feed-item-header');
    divHeader.append(h3);
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
    if (item.description) {
      const divDescr = document.createElement('div');
      const pEl = document.createElement('p');
      pEl.textContent = item.description;
      divDescr.append(pEl);
      divInfo.append(divDescr);
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

function getFilterMap(container = document) {
  const filterMap = new Map();

  container.querySelectorAll('.custom-select-wrapper').forEach((el) => {
    const key = el.querySelector('[data-name]')?.dataset.name;
    const value = el.querySelector('.custom-select')?.textContent?.trim().toLowerCase();
    if (key && value) {
      filterMap.set(key, value);
    }
  });
  return filterMap;
}

function renderItems(container, items, layout) {
  if (layout === 'cards') {
    container.classList.add('cards', 'block', 'feed');
    renderCardItems(items, container);
  } else {
    container.classList.add('feed');
    renderListItems(items, container);
  }
  return container;
}

function renderFeed(items, block, layout) {
  const feedEl = document.createElement('div');
  const activeFilters = getFilterMap(block);
  if (activeFilters.size !== 0) {
    const filteredItems = items.filter((item) => activeFilters.entries()
      .every(([key, value]) => {
        if (value.startsWith('all ')) return true;
        const itemValue = item[key]?.toString().toLowerCase().trim();
        const filterValue = value.toString().toLowerCase().trim();
        return itemValue === filterValue;
      }));
    return renderItems(feedEl, filteredItems, layout);
  }
  return renderItems(feedEl, items, layout);
}

function createCustomSelect(filter, items, onSelect) {
  const uniqueFilterValues = [...new Set(
    items.map((item) => item[filter.toLowerCase()]).filter(Boolean),
  )];

  const selectWrapper = document.createElement('div');
  selectWrapper.classList.add('custom-select-wrapper');
  selectWrapper.style.display = 'flex';
  selectWrapper.style.alignItems = 'center';
  selectWrapper.style.gap = '10px';

  // const label = document.createElement('label');
  // label.textContent = filter;
  // label.classList.add('custom-select-label');
  // selectWrapper.prepend(label);

  const select = document.createElement('div');
  select.classList.add('custom-select');
  select.textContent = `All ${filter}s`;
  select.dataset.name = filter.toLowerCase();

  const optionsWrapper = document.createElement('div');
  optionsWrapper.classList.add('custom-options');
  optionsWrapper.style.display = 'none';

  const createOption = (value) => {
    const option = document.createElement('div');
    option.classList.add('custom-option');
    option.textContent = value;
    option.addEventListener('click', () => {
      select.textContent = value;
      optionsWrapper.style.display = 'none';
      select.classList.remove('open');
      const parentBlock = select.closest('.program-feed');
      const feedBlock = onSelect(items, parentBlock);
      const oldFeedBlock = parentBlock.querySelector('div.feed');
      if (oldFeedBlock) parentBlock.replaceChild(feedBlock, oldFeedBlock);
      else parentBlock.append(feedBlock);
    });
    return option;
  };

  optionsWrapper.append(createOption(`All ${filter}s`));
  uniqueFilterValues.forEach((value) => {
    optionsWrapper.append(createOption(value));
  });

  select.addEventListener('click', () => {
    const isOpen = optionsWrapper.style.display === 'none';
    optionsWrapper.style.display = isOpen ? 'block' : 'none';
    select.classList.toggle('open', isOpen);
  });

  selectWrapper.append(select);
  selectWrapper.append(optionsWrapper);
  return selectWrapper;
}

function renderControls(filters, items, layout) {
  const container = document.createElement('div');
  container.classList.add('custom-select-flex');

  filters.forEach((filter) => {
    const selectWrapper = createCustomSelect(
      filter,
      items,
      (filteredItems, node) => renderFeed(filteredItems, node, layout),
    );
    container.append(selectWrapper);
  });
  return container;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const filter = config?.filter?.trim();
  const filterArray = filter ? filter.split(',').map((val) => val.trim()) : [];
  const layout = config?.layout?.trim().toLowerCase();
  const items = await fetchItems(config);

  block.innerHTML = '';
  if (!Array.isArray(filterArray) || filterArray.length !== 0) {
    block.append(renderControls(filterArray, items, layout));
  }
  block.append(renderFeed(items, block, layout));
}
