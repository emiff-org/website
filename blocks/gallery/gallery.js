import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const index = config?.index?.trim();

  const photos = await ffetch(index).all();

  block.textContent = ''; // remove block config from DOM

  photos.forEach((photo) => {
    const div = document.createElement('div');
    div.classList.add('gallery-photo');
    div.appendChild(createOptimizedPicture(photo.Image.toLowerCase(), photo.Description, false, [{ width: '350' }]));
    block.append(div);
  });
}
