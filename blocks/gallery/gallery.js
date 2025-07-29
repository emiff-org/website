import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';
import { formatDateVerbose, parseDateTime } from '../../scripts/components-utils.js';

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
  const div = document.createElement('div');
  div.classList.add('modal-text');
  const context = document.createElement('p');
  let text = element.dataset.people;
  if (element.dataset.event.length !== 0) text += ` at the ${element.dataset.event}`;
  if (element.dataset.date) {
    const date = parseDateTime(element.dataset.date);
    text += ` (${formatDateVerbose(date, 'gallery')})`;
  }
  context.textContent = text;
  div.appendChild(context);
  const description = document.createElement('p');
  description.textContent = element.dataset.description;
  div.appendChild(description);

  fragment.append(div);
  return fragment;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const index = config?.index?.trim();
  const eventFilter = config?.event?.trim().toLowerCase();

  let photos = await ffetch(index).all();

  // filter by events if specified
  photos = photos.filter(
    (photo) => !eventFilter || (photo.Event && photo.Event.toLowerCase().includes(eventFilter)),
  );

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
    button.dataset.people = photo.People;
    button.dataset.image = photo.Image.toLowerCase();
    button.appendChild(
      createOptimizedPicture(
        photo.Image.toLowerCase(),
        photo.Description,
        false,
        [{ width: '350' }],
      ),
    );
    const divOverlay = document.createElement('div');
    divOverlay.classList.add('gallery-overlay');
    divOverlay.textContent = photo.People;
    button.appendChild(divOverlay);

    div.appendChild(button);

    block.append(div);
  });
}
