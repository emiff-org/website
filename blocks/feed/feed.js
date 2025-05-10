import getIndexPath from '../../scripts/index-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';

async function fetchItems(config) {
  const index = config?.index?.trim().toUpperCase();
  const type = config?.type?.trim().toLowerCase();
  const limit = parseInt(config?.limit ?? '', 10) || undefined;

  const rawItems = await ffetch(getIndexPath(`INDEX_${index}`)).all();
  return rawItems
    .filter((item) => item.type.toLowerCase() === type)
    .sort((a, b) => {
      const dateA = parseInt(a.publicationDate || '0', 10);
      const dateB = parseInt(b.publicationDate || '0', 10);
      return dateB - dateA; // descending
    })
    .slice(0, Number.isNaN(limit) ? undefined : limit);
}

function renderItems(itemsToRender, divWrapper) {
  divWrapper.innerHTML = ''; // Clear previous items

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
    divWrapper.append(div);
  });
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

  const items = await fetchItems(config);
  const rawItems = await ffetch(getIndexPath(`INDEX_${config?.index?.trim().toUpperCase()}`)).all();

  block.textContent = '';

  const divWrapper = document.createElement('div');
  divWrapper.classList.add('feed');

  if (filter) {
    const selectWrapper = createCustomSelect(
      filter,
      rawItems,
      items,
      (filteredItems) => renderItems(filteredItems, divWrapper),
    );
    block.append(selectWrapper);
  }

  renderItems(items, divWrapper);
  block.append(divWrapper);
}
