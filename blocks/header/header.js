import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getLocale } from '../../scripts/i18n-utils.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Highlights the active navigation link based on the current URL path.
 * Usage: Should be called after the header nav has been fully loaded into the DOM.
 */
export function highlightActiveNav() {
  const currentPath = window.location.pathname.replace(/\/$/, ''); // Normalize trailing slash
  document.querySelectorAll('sectionheader nav .nav-sections a').forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
    if (linkPath === currentPath) {
      const li = link.closest('li');
      if (li) li.classList.add('active');
    }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load localised nav as fragment
  const navMeta = getMetadata('nav');
  const language = getLocale();
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `/${language}/nav`;
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const navSections = nav.querySelector('.nav-sections');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // top level nav items
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul:first-of-type > li').forEach((navSection) => {
      // Extract just the text directly inside the <li> (not including child <ul>)
      const labelNode = Array.from(navSection.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
      );

      const span = document.createElement('span');
      span.classList.add('nav-label');
      span.textContent = labelNode.textContent.trim();
      navSection.replaceChild(span, labelNode);

      let timeoutId;
      let isTimeoutPending = false;

      span.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          isTimeoutPending = true;
          timeoutId = setTimeout(() => {
            isTimeoutPending = false;
            toggleAllNavSections(navSections, true);
            document.querySelector('header .nav-background')?.classList.add('is-visible');
          }, 300);
        }
      });
      span.addEventListener('mouseleave', () => {
        if (isDesktop.matches && isTimeoutPending) {
          clearTimeout(timeoutId);
          // toggleAllNavSections(navSections, false);
          // document.querySelector('header .nav-background')?.classList.remove('is-visible');
        }
      });
    });
  }

  // highlight active nav items
  const currentPath = window.location.pathname.replace(/\/$/, ''); // Normalize trailing slash
  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((entry) => {
    entry.querySelectorAll(':scope ul > li a').forEach((link) => {
      const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
      if (linkPath === currentPath) {
        const li = link.closest('li');
        if (li) li.classList.add('active'); // menu entry
        entry.classList.add('active'); // top nav entry
      }
    });
  });

  // navigation background
  const navBackground = document.createElement('div');
  navBackground.classList.add('nav-background');
  navBackground.addEventListener('mouseout', (event) => {
    if (!isDesktop.matches) return;

    const toElement = event.relatedTarget;
    const navWrapper = document.querySelector('.nav-sections');

    // avoid events from child elements and dropdown menus
    if (event.target === navBackground
      && toElement
      && !navWrapper.contains(toElement)
      && !navBackground.contains(toElement)) {
      toggleAllNavSections(navSections, false);
      navBackground.classList.remove('is-visible');
    }
  });

  // brand logo on nav background
  const navLogo = document.createElement('div');
  navLogo.classList.add('nav-logo');
  const imgLogo = document.createElement('img');
  imgLogo.src = '/icons/brand.webp';
  imgLogo.alt = 'Brand Logo';
  navLogo.append(imgLogo);
  navBackground.append(navLogo);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  navWrapper.append(navBackground);
  block.append(navWrapper);
}
