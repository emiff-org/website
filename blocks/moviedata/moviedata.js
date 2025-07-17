export default function decorate(block) {
  const rows = Array.from(block.children);

  const descriptionRow = rows.find((row) => {
    const label = row.querySelector('div:first-child > p');
    return label?.textContent?.trim().toLowerCase() === 'description';
  });

  if (descriptionRow) {
    const descDiv = document.createElement('div');
    descDiv.className = 'moviedata-description';

    const content = descriptionRow.querySelector('div:last-child');
    if (content) descDiv.append(content);

    block.prepend(descDiv);
    // remove from DOM and array
    descriptionRow.remove();
    const index = rows.indexOf(descriptionRow);
    if (index !== -1) rows.splice(index, 1);
  }

  const infoDiv = document.createElement('div');
  infoDiv.className = 'moviedata-info';

  rows.forEach((row) => {
    const label = row.querySelector('div:first-child > p');
    const value = row.querySelector('div:last-child > p');
    const rowDiv = document.createElement('div');
    rowDiv.className = 'moviedata-info-item';

    if (label && value) {
      if (label) {
        const div = document.createElement('div');
        const span = document.createElement('span');
        span.textContent = label.textContent;
        div.append(span);
        rowDiv.append(div);
      }

      if (value) {
        const div = document.createElement('div');
        const span = document.createElement('span');
        span.textContent = value.textContent;
        div.append(span);
        rowDiv.append(div);
      }
    }
    infoDiv.append(rowDiv);
    row.remove();
  });
  block.append(infoDiv);
}
