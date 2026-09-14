const type = new URLSearchParams(window.location.search).get('type') || 'from';
const title = document.querySelector('#title');
title.textContent = type === 'to' ? 'Select destination' : 'Select starting point';

function selectLocation(value) {
  localStorage.setItem(type === 'to' ? 'busTravelTo' : 'busTravelFrom', value);
  window.location.href = '../home/index.html';
}

document.querySelector('#locationForm').addEventListener('submit', (event) => {
  event.preventDefault();
  selectLocation(document.querySelector('#locationInput').value.trim());
});
document.querySelectorAll('.suggestions button').forEach((button) => button.addEventListener('click', () => selectLocation(button.textContent)));
