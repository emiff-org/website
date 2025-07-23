import {
  // createOptimizedPicture,
  decorateIcons,
  readBlockConfig,
} from '../../scripts/aem.js';
import {
  fetchLocalPlaceholders,
  getConfigAsMap,
} from '../../scripts/scripts-ext.js';
import { getLocale } from '../../scripts/i18n-utils.js';

const searchParams = new URLSearchParams(window.location.search);

function findNextHeading(el) {
  let preceedingEl = el.parentElement.previousElement || el.parentElement.parentElement;
  let h = 'H2';
  while (preceedingEl) {
    const lastHeading = [...preceedingEl.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop();
    if (lastHeading) {
      const level = parseInt(lastHeading.nodeName[1], 10);
      h = level < 6 ? `H${level + 1}` : 'H6';
      preceedingEl = false;
    } else {
      preceedingEl = preceedingEl.previousElement || preceedingEl.parentElement;
    }
  }
  return h;
}

function highlightTextElements(terms, elements) {
  elements.forEach((element) => {
    if (!element || !element.textContent) return;

    const matches = [];
    const { textContent } = element;
    terms.forEach((term) => {
      let start = 0;
      let offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      while (offset >= 0) {
        matches.push({ offset, term: textContent.substring(offset, offset + term.length) });
        start = offset + term.length;
        offset = textContent.toLowerCase().indexOf(term.toLowerCase(), start);
      }
    });

    if (!matches.length) {
      return;
    }

    matches.sort((a, b) => a.offset - b.offset);
    let currentIndex = 0;
    const fragment = matches.reduce((acc, { offset, term }) => {
      if (offset < currentIndex) return acc;
      const textBefore = textContent.substring(currentIndex, offset);
      if (textBefore) {
        acc.appendChild(document.createTextNode(textBefore));
      }
      const markedTerm = document.createElement('mark');
      markedTerm.textContent = term;
      acc.appendChild(markedTerm);
      currentIndex = offset + term.length;
      return acc;
    }, document.createDocumentFragment());
    const textAfter = textContent.substring(currentIndex);
    if (textAfter) {
      fragment.appendChild(document.createTextNode(textAfter));
    }
    element.innerHTML = '';
    element.appendChild(fragment);
  });
}

export async function fetchData(source) {
  const response = await fetch(source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading API response', response);
    return null;
  }

  const json = await response.json();
  if (!json) {
    // eslint-disable-next-line no-console
    console.error('empty API response', source);
    return null;
  }

  return json.data;
}

function renderResult(result, searchTerms, titleTag) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = result.path;
  // TODO check for better image integration
  // if (result.image) {
  //   const wrapper = document.createElement('div');
  //   wrapper.className = 'search-result-image';
  //   const pic = createOptimizedPicture(result.image, '', false, [{ width: '375' }]);
  //   wrapper.append(pic);
  //   a.append(wrapper);
  // }
  if (result.type) {
    const subtitle = document.createElement('p');
    subtitle.className = 'search-result-subtitle';
    subtitle.textContent = result.type;
    a.append(subtitle);
  }
  if (result.title) {
    const title = document.createElement(titleTag);
    title.className = 'search-result-title';
    const link = document.createElement('a');
    link.href = result.path;
    link.textContent = result.title;
    highlightTextElements(searchTerms, [link]);
    title.append(link);
    a.append(title);
  }
  if (result.description) {
    const description = document.createElement('p');
    description.textContent = result.description;
    highlightTextElements(searchTerms, [description]);
    a.append(description);
  }
  li.append(a);
  return li;
}

function getResultsContainer() {
  return document.querySelector('.search-results');
}

function clearSearch(block) {
  block.innerHTML = '';
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = '';
    searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  }
}

async function renderResults(block, config, filteredData, searchTerms) {
  block.innerHTML = '';

  if (filteredData.length) {
    block.classList.remove('no-results');
    filteredData.forEach((result) => {
      const li = renderResult(result, searchTerms, 'h3');
      block.append(li);
    });
  } else {
    const noResultsMessage = document.createElement('li');
    block.classList.add('no-results');
    noResultsMessage.textContent = config.placeholders.searchNoResults || 'No results found.';
    block.append(noResultsMessage);
  }
}

function compareFound(hit1, hit2) {
  return hit1.minIdx - hit2.minIdx;
}

function filterData(searchTerms, data, filters) {
  const foundInHeader = [];
  const foundInMeta = [];

  data.forEach((result) => {
    let minIdx = -1;

    const fCheck = Object.entries(filters).some(([key, values]) => {
      const resultValue = result[key]?.toLowerCase();
      return values.includes(resultValue);
    });
    if (fCheck) return;

    searchTerms.forEach((term) => {
      const idx = (result.header || result.title).toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push({ minIdx, result });
      return;
    }

    const metaContents = `${result.title} ${result.description} ${result.path.split('/').pop()}`.toLowerCase();
    searchTerms.forEach((term) => {
      const idx = metaContents.indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInMeta.push({ minIdx, result });
    }
  });

  return [
    ...foundInHeader.sort(compareFound),
    ...foundInMeta.sort(compareFound),
  ].map((item) => item.result);
}

async function handleSearch(e, block, config) {
  const searchValue = e.target.value;
  searchParams.set('q', searchValue);
  if (window.history.replaceState) {
    const url = new URL(window.location.href);
    url.search = searchParams.toString();
    window.history.replaceState({}, '', url.toString());
  }

  if (config.mode === 'results' && searchValue.length < 3) {
    clearSearch(block);
    return;
  }
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => !!term);

  const data = await fetchData(config.source);
  const filteredData = filterData(searchTerms, data, config.filters);

  // query the results container outside of current block
  await renderResults(getResultsContainer(), config, filteredData, searchTerms);
}

function searchResultsContainer(block) {
  const results = document.createElement('ul');
  results.className = 'search-results';
  results.dataset.h = findNextHeading(block);
  return results;
}

function searchInput(block, config) {
  const input = document.createElement('input');
  input.setAttribute('type', 'search');
  input.className = 'search-input';

  const searchPlaceholder = config.placeholders.searchPlaceholder || 'Search...';
  input.placeholder = searchPlaceholder;
  input.setAttribute('aria-label', searchPlaceholder);

  input.addEventListener('input', (e) => {
    handleSearch(e, block, config);
  });

  input.addEventListener('keyup', (e) => { if (e.code === 'Escape') { clearSearch(getResultsContainer()); } });

  return input;
}

// function searchIcon() {
//   const icon = document.createElement('span');
//   icon.classList.add('icon', 'icon-search');
//   return icon;
// }

function searchBox(block, config) {
  const box = document.createElement('div');
  box.classList.add('search-box');
  box.append(
    // searchIcon(),
    searchInput(block, config),
  );

  return box;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const mode = config?.mode?.trim().toLowerCase();
  const filtersValue = config?.filters?.trim();
  const filters = getConfigAsMap(filtersValue);

  const placeholders = await fetchLocalPlaceholders();
  const language = getLocale();
  const source = block.querySelector('a[href]') ? block.querySelector('a[href]').href : `/${language}/query-index.json`;
  block.innerHTML = '';
  if (mode === 'input') {
    block.append(searchBox(block, {
      source,
      placeholders,
      mode,
      filters,
    }));

    if (searchParams.get('q')) {
      const input = block.querySelector('input');
      input.value = searchParams.get('q');
      input.dispatchEvent(new Event('input'));
    }
  } else if (mode === 'results') {
    block.append(searchResultsContainer(block));
  }

  decorateIcons(block);
}
