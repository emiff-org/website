export function parseDateTime(dateStr, timeStr) {
  // convert '30.10.2024' or '2024-30-10' to '2024-10-30T22:00'
  if (!dateStr || dateStr.length === 0) return null;
  let sDay = '';
  let year = '';
  let sMonth = '';
  if (dateStr.includes('.')) {
    [sDay, sMonth, year] = dateStr.split('.');
  } else {
    [year, sDay, sMonth] = dateStr.split('-');
  }
  // because Date in Safari doesn't like single digit days/months
  if (!sDay || !sMonth) return null;

  const day = sDay.padStart(2, '0');
  const month = sMonth.padStart(2, '0');

  if (timeStr) return new Date(`${year}-${month}-${day}T${timeStr || '00:00'}`);
  return new Date(`${year}-${month}-${day}`);
}

export function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function formatDateVerbose(date) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. Sat
  const month = date.toLocaleDateString('en-US', { month: 'short' }); // e.g. Nov
  const day = date.getDate();
  const ordinal = getOrdinal(day);
  return `${weekday}, ${month} ${day}${ordinal}`;
}

export function getIcon(name) {
  const sEl = document.createElement('span');
  sEl.classList.add('icon', `icon-${name}`);
  const iEl = document.createElement('img');
  iEl.src = `/icons/icon-${name}.svg`;
  sEl.appendChild(iEl);
  return sEl;
}

export async function getSVGIcon(name) {
  const sEl = document.createElement('span');
  sEl.classList.add('icon', `icon-${name}`);

  try {
    const res = await fetch(`/icons/icon-${name}.svg`);
    if (!res.ok) throw new Error(`Icon ${name} not found`);
    const svgText = await res.text();

    // Parse the SVG and inline it
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = svgDoc.querySelector('svg');
    if (svgEl) {
      // svgEl.setAttribute('fill', 'currentColor'); // Make fill CSS-controllable
      svgEl.classList.add(`icon-${name}-svg`);
      sEl.appendChild(svgEl);
    }
  } catch (err) {
    console.error(`Failed to load icon: ${name}`, err); // eslint-disable-line no-console
  }

  return sEl;
}

export function createCustomSelect(filter, items, onSelect, value = undefined) {
  const uniqueFilterValues = [...new Set(
    items.map((item) => item[filter.toLowerCase()]).filter(Boolean),
  )];

  const selectWrapper = document.createElement('div');
  selectWrapper.classList.add('custom-select-wrapper');
  selectWrapper.style.display = 'flex';
  selectWrapper.style.alignItems = 'center';
  selectWrapper.style.gap = '10px';

  const select = document.createElement('div');
  select.classList.add('custom-select');
  select.textContent = `All ${filter}s`;
  select.dataset.name = filter.toLowerCase();
  if (value) select.textContent = value;

  const optionsWrapper = document.createElement('div');
  optionsWrapper.classList.add('custom-options');
  optionsWrapper.style.display = 'none';

  const createOption = (oValue) => {
    const option = document.createElement('div');
    option.classList.add('custom-option');
    option.textContent = oValue;
    option.addEventListener('click', () => {
      select.textContent = oValue;
      optionsWrapper.style.display = 'none';
      select.classList.remove('open');
      onSelect(select);
    });
    return option;
  };

  optionsWrapper.append(createOption(`All ${filter}s`));
  uniqueFilterValues.forEach((fValue) => {
    optionsWrapper.append(createOption(fValue));
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

export async function createFilterToggle() {
  const toggleWrapper = document.createElement('div');
  toggleWrapper.classList.add('toggle-wrapper');

  const button = document.createElement('button');
  button.classList.add('mobile-filter');
  const icon = await getSVGIcon('filter');
  button.appendChild(icon);

  button.addEventListener('click', () => {
    const customSelectWrapper = document.querySelector('.custom-select-flex');
    const isOpen = customSelectWrapper.style.display === 'flex';
    customSelectWrapper.style.display = isOpen ? 'none' : 'flex';
    button.classList.toggle('open', !isOpen);
  });

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select.open').forEach((select) => {
      if (select && !select.contains(e.target)) {
        if (!select.nextElementSibling.contains(e.target)) {
          select.nextElementSibling.style.display = 'none';
          select.classList.remove('open');
        }
      }
    });
  });
  toggleWrapper.append(button);
  return toggleWrapper;
}

export function getFiltersKvMap(filter) {
  return new Map(
    (filter ? filter.split(',') : [])
      .map((val) => val.trim())
      .map((entry) => {
        const [key, value] = entry.split('=').map((s) => s.trim());
        return [key, value ?? ''];
      }),
  );
}

export function getCSFilterMap(container = document) {
  const filterMap = new Map();

  container.querySelectorAll('.custom-select-wrapper').forEach((el) => {
    const key = el.querySelector('[data-name]')?.dataset.name;
    const value = el.querySelector('.custom-select')?.textContent?.trim();
    if (key && value) {
      filterMap.set(key, value);
    }
  });
  return filterMap;
}
