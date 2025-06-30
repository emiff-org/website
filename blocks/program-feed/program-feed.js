import getIndexPath from '../../scripts/index-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';

async function fetchItems(config) {
  // const type = config?.type?.trim().toLowerCase();
  const limit = parseInt(config?.limit ?? '', 10) || undefined;

  const [programData, entriesData, blocksData, eventsData, locationsData] = await Promise.all([
    ffetch(getIndexPath('INDEX_PROGRAM')).all(),
    ffetch(getIndexPath('INDEX_ENTRIES')).all(),
    ffetch(getIndexPath('INDEX_BLOCKS')).all(),
    ffetch(getIndexPath('INDEX_EVENTS')).all(),
    ffetch(getIndexPath('INDEX_LOCATIONS')).all(),
  ]);

  const merged = programData.map((item) => {
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
      genre: entry?.genre || '',
      languages: entry?.languages || block?.languages || event?.languages || '',
      section: entry?.section || '',
      locationMap: location?.map || '',
    };
  });

  return merged
    // .filter((item) => item.type.toLowerCase() === type)
    .sort((a, b) => {
      const dateA = parseInt(a.date || '0', 10);
      const dateB = parseInt(b.date || '0', 10);
      return dateB - dateA; // descending
    })
    .slice(0, Number.isNaN(limit) ? undefined : limit);
}

function renderCardItems(itemsToRender, container) {
  const ul = document.createElement('ul');

  itemsToRender.forEach((loc) => {
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

function renderListItems(itemsToRender, container) {
  container.innerHTML = ''; // Clear previous items

  itemsToRender.forEach((item) => {
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
      h3.append(a);
    } else {
      h3.textContent = item.title;
    }
    div.append(h3);

    if (item.type) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = `Type: ${item.type}`;
      div.append(pDescr);
    }
    if (item.location) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = `Location: ${item.location}`;
      div.append(pDescr);
    }
    if (item.languages) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = `Languages: ${item.languages}`;
      div.append(pDescr);
    }
    if (item.section) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = `Section: ${item.section}`;
      div.append(pDescr);
    }
    if (item.date) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = `Date: ${item.date}`;
      div.append(pDescr);
    }
    if (item.time) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = `Time: ${item.time}`;
      div.append(pDescr);
    }
    if (item.genre) {
      const pDescr = document.createElement('p');
      pDescr.classList.add('feed-item-body');
      pDescr.textContent = `Genre: ${item.genre}`;
      div.append(pDescr);
    }
    container.append(div);
  });
  return container;
}

function renderItems(items, layout) {
  const container = document.createElement('div');

  if (layout === 'cards') {
    container.classList.add('cards', 'block');
    renderCardItems(items, container);
  } else {
    container.classList.add('feed');
    renderListItems(items, container);
  }
  return container;
}

function createCustomSelect(filter, rawItems, items, onSelect) {
  const uniqueFilterValues = [...new Set(
    rawItems.map((item) => item[filter.toLowerCase()]).filter(Boolean),
  )];

  const selectWrapper = document.createElement('div');
  selectWrapper.classList.add('custom-select-wrapper');
  selectWrapper.style.display = 'flex';
  selectWrapper.style.alignItems = 'center';
  selectWrapper.style.gap = '10px';

  const label = document.createElement('label');
  label.textContent = filter;
  label.classList.add('custom-select-label');
  selectWrapper.prepend(label);

  const select = document.createElement('div');
  select.classList.add('custom-select');
  select.textContent = 'All';

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
      const filteredItems = value === 'All'
        ? items
        : items.filter((item) => item[filter.toLowerCase()] === value);
      onSelect(filteredItems);
    });
    return option;
  };

  optionsWrapper.append(createOption('All'));
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

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const filter = config?.filter?.trim();
  const layout = config?.layout?.trim().toLowerCase();

  const items = await fetchItems(config);
  const rawItems = await ffetch(getIndexPath(`INDEX_${config?.index?.trim().toUpperCase()}`)).all();

  block.textContent = '';

  if (filter) {
    const selectWrapper = createCustomSelect(
      filter,
      rawItems,
      items,
      (filteredItems) => renderItems(filteredItems, layout),
    );
    block.append(selectWrapper);
  }

  block.append(renderItems(items, layout));
}
