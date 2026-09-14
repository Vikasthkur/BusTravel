const account = JSON.parse(localStorage.getItem('busTravelAccount') || 'null');
const guestProfile = document.querySelector('#guestProfile');
const loggedProfile = document.querySelector('#loggedProfile');
const ownerActions = document.querySelector('#ownerActions');
const guestMenu = document.querySelector('#guestMenu');
const logoutButton = document.querySelector('#logoutButton');

if (account) {
	guestProfile.hidden = true;
	loggedProfile.hidden = false;
	ownerActions.hidden = false;
	guestMenu.hidden = true;
	logoutButton.hidden = false;
	document.querySelector('#userName').textContent = account.name;
	document.querySelector('#userContact').textContent = account.contact;
}

document.querySelectorAll('.locked').forEach((item) => {
	item.addEventListener('click', () => {
		document.querySelector('#profileMessage').textContent = item.dataset.message;
	});
});

logoutButton.addEventListener('click', () => {
	localStorage.removeItem('busTravelAccount');
	localStorage.removeItem('busTravelToken');
	window.location.reload();
});