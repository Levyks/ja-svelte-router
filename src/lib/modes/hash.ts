import type { Router, Mode, RouteResolved } from '$lib/typings';

function init<Meta = unknown>(router: Router<Meta>) {
	function handleHashChange() {
		const hash = window.location.hash.slice(1) || '/';
		const path = '/' + hash.slice(router.base.length, hash.endsWith('/') ? -1 : hash.length);
		router.push(path);
	}

	window.addEventListener('hashchange', handleHashChange);

	handleHashChange();
}

function update<Meta = unknown>(router: Router<Meta>, resolved: RouteResolved<Meta>) {
	if (resolved.route.path === '*') return;
	const path = resolved.route.getPath(resolved.params);
	const hash = router.base + path.slice(1);
	window.location.hash = hash;
}

const mode: Mode = { init, update };

export default mode;
