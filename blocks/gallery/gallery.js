import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';

/**
 * Builds modal content for data from given element.
 * This assume certain dataset attributes to be available in the element.
 * @param {Element} element The element with modal dataset
 */
export async function createModalContent(element) {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(
    createOptimizedPicture(element.dataset.image, element.dataset.description, false),
  );
  const description = document.createElement('p');
  description.textContent = element.dataset.description;
  fragment.appendChild(description);
  const date = document.createElement('p');
  date.textContent = `Date: ${element.dataset.date}`;
  fragment.appendChild(date);
  const event = document.createElement('p');
  event.textContent = `Event: ${element.dataset.event}`;
  fragment.appendChild(event);

  fragment.append(fragment);
  return fragment;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const index = config?.index?.trim();

  const photos = await ffetch(index).all();

  block.textContent = ''; // remove block config from DOM

  photos.forEach((photo) => {
    const div = document.createElement('div');
    div.classList.add('gallery-photo');
    const button = document.createElement('button');
    button.classList.add('gallery-button');
    button.classList.add('js-modal-trigger');
    button.dataset.description = photo.Description;
    button.dataset.event = photo.Event;
    button.dataset.date = photo.Date;
    button.dataset.image = photo.Image.toLowerCase();
    button.appendChild(
      createOptimizedPicture(
        photo.Image.toLowerCase(),
        photo.Description,
        false,
        [{ width: '350' }],
      ),
    );
    div.appendChild(button);
    block.append(div);
  });
}
