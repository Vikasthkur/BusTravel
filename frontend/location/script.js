const type = new URLSearchParams(window.location.search).get('type') || 'from';
const title = document.querySelector('#title');
title.textContent = type === 'to' ? 'Select destination' : 'Select starting point';

function selectLocation(value) {
  const location = value.trim();
  if (!location) {
    document.querySelector('#locationInput').setCustomValidity('Enter a location.');
    document.querySelector('#locationInput').reportValidity();
    return;
  }
  localStorage.setItem(type === 'to' ? 'busTravelTo' : 'busTravelFrom', location);
  window.location.href = '../home/index.html';
}

document.querySelector('#locationForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.querySelector('#locationInput');
  input.setCustomValidity('');
  if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();
  selectLocation(input.value);
});
document.querySelectorAll('.suggestions button').forEach((button) => button.addEventListener('click', () => selectLocation(button.textContent)));
