import { loadFragment } from '../fragment/fragment.js';
import {
  buildBlock, decorateBlock, loadBlock, loadCSS,
} from '../../scripts/aem.js';

/*
  This is not a traditional block, so there is no decorate function.
  Instead, links to a /modals/ path are automatically transformed into a modal.
  Other blocks can also use the createModal() and openModal() functions.
*/

export async function createModal(contentNodes) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);

  // Create modal overlay container
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  // Modal content wrapper
  const modal = document.createElement('div');
  modal.classList.add('modal');

  // Modal content
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  modalContent.append(...contentNodes);
  modal.appendChild(modalContent);

  // Close button
  const closeButton = document.createElement('button');
  closeButton.classList.add('close-button');
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.type = 'button';
  closeButton.innerHTML = '<span class="icon icon-close"></span>';
  closeButton.addEventListener('click', closeModal);
  modal.prepend(closeButton);

  overlay.appendChild(modal);

  // Block container
  const block = buildBlock('modal', '');
  document.querySelector('main').append(block);
  decorateBlock(block);
  await loadBlock(block);

  block.innerHTML = '';
  block.appendChild(overlay);

  // Click outside modal to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESC to close
  const escListener = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  // Close handler
  function closeModal() {
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', escListener);
    block.remove();
  }

  return {
    block,
    showModal: () => {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', escListener);
      // optionally reset scroll in modal content
      modalContent.scrollTop = 0;
    },
  };
}


export async function openModalFromFragment(fragmentUrl) {
  const path = fragmentUrl.startsWith('http')
    ? new URL(fragmentUrl, window.location).pathname
    : fragmentUrl;

  const fragment = await loadFragment(path);
  const { showModal } = await createModal(fragment.childNodes);
  showModal();
}
