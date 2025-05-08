import getIndexPath from '../../scripts/index-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const index = config?.index?.trim().toUpperCase();
  const filter = config?.filter?.trim().toLowerCase();
  const limit = parseInt(config?.limit ?? '', 10) || undefined;
  const type = config?.type?.trim().toLowerCase();

  const rawItems = await ffetch(getIndexPath(`INDEX_${index}`)).all();
  const items = rawItems
    .filter((item) => item.type.toLowerCase() === type)
    .sort((a, b) => {
      const dateA = parseInt(a.publicationDate || '0', 10);
      const dateB = parseInt(b.publicationDate || '0', 10);
      return dateB - dateA; // descending
    })
    .slice(0, Number.isNaN(limit) ? undefined : limit);

  block.textContent = ''; // remove block config from DOM

  const divWrapper = document.createElement('div');
  divWrapper.classList.add('feed');

  const renderItems = (itemsToRender) => {
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
  };

  // Create custom select component if filter is specified
  if (filter) {
    const uniqueFilterValues = [...new Set(rawItems.map((item) => item[filter]).filter(Boolean))];

    const selectWrapper = document.createElement('div');
    selectWrapper.classList.add('custom-select-wrapper');

    const select = document.createElement('div');
    select.classList.add('custom-select');
    select.textContent = 'Category';

    const optionsWrapper = document.createElement('div');
    optionsWrapper.classList.add('custom-options');
    optionsWrapper.style.display = 'none'; // Initially hidden

    const createOption = (value) => {
      const option = document.createElement('div');
      option.classList.add('custom-option');
      option.textContent = value;
      option.addEventListener('click', () => {
        select.textContent = value;
        optionsWrapper.style.display = 'none';
        const filteredItems = value === 'All'
          ? items
          : items.filter((item) => item[filter] === value);
        renderItems(filteredItems);
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
    block.append(selectWrapper);
  }

  renderItems(items); // Initial render
  block.append(divWrapper);
}
