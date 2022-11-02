import { getContext } from 'svelte';
import { key } from '$lib/router';
import type { Context } from '../typings';

export function link(node: HTMLAnchorElement) {
	const context = getContext<Context>(key);

	if (!context) {
		throw new Error('Router context not found');
	}

	const router = context.getRouter();

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		router.push(node.href);
	}

	node.addEventListener('click', handleClick);

	return {
		destroy() {
			node.removeEventListener('click', handleClick);
		}
	};
}
