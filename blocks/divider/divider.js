export default function decorate(block) {
  const hasText = block.textContent.trim() !== '';
  block.classList.add('divider');

  if (hasText) {
    block.classList.add('divider--text');
    const span = document.createElement('span');
    span.textContent = block.textContent.trim();
    block.textContent = '';
    block.append(span);
  }
}