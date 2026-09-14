const formMessage = document.querySelector('#formMessage');
const fromValue = document.querySelector('#fromValue');
const toValue = document.querySelector('#toValue');
const fromLocation = localStorage.getItem('busTravelFrom');
const toLocation = localStorage.getItem('busTravelTo');

if (fromLocation) fromValue.textContent = fromLocation;
if (toLocation) toValue.textContent = toLocation;

document.querySelector('#searchButton').addEventListener('click', () => {
  const from = fromValue.textContent === 'Choose starting point' ? '' : fromValue.textContent;
  const to = toValue.textContent === 'Choose destination' ? '' : toValue.textContent;

  if (!from || !to) {
    showMessage('Choose both a starting point and destination.');
    return;
    return;
  }

  window.location.href = `/search/index.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
});
