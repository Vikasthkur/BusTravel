/*
 * Set BUSTRAVEL_API_URL before this file is loaded for a native build, for
 * example to the deployed HTTPS API. Browser builds served by Express use the
 * same origin; a local static preview uses the computer's port 3000.
 */
const configuredApi = window.BUSTRAVEL_API_URL || '';
if (configuredApi) {
	window.BUSTRAVEL_API = configuredApi.replace(/\/+$/, '');
} else if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
	window.BUSTRAVEL_API = window.location.port === '3000'
		? ''
		: `${window.location.protocol}//${window.location.hostname}:3000`;
} else {
	window.BUSTRAVEL_API = '';
}
