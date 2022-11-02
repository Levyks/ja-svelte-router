import { get_store_value } from 'svelte/internal';
import { writable } from 'svelte/store';
import { mapBaseUrl, mapRouteDefinition } from './mappers';
import hash from './modes/hash';
import { resolveRouteByName, resolveRouteByPath } from './resolvers';
import type {
	CreateRouterOptions,
	Router,
	RouteLocation,
	RouteResolved,
	Mode,
	Route,
	Params
} from './typings';

export const key = Symbol();

function validateParams<Meta = unknown>(route: Route<Meta>, params: Params) {
	route.pathParams.forEach((param, idx) => {
		if (idx < route.pathParams.length - 1 && !['string', 'number'].includes(typeof params[param])) {
			throw new Error(
				`Missing or invalid param "${param}" in route "${route.name || route.path}": ${
					params[param]
				}`
			);
		}
	});
}

export function createRouter<Meta = unknown>(options: CreateRouterOptions<Meta>): Router<Meta> {
	const mode = options.mode || 'hash';
	const modeHandler: Mode = mode === 'hash' ? hash : hash;
	const base = mapBaseUrl(options.base || '/');
	const routes = options.routes.map((def) => mapRouteDefinition(def, null));
	const beforeEach = options.beforeEach || [];
	const afterEach = options.afterEach || [];
	const currentRoute = writable<RouteResolved<Meta> | null>();
	const errorComponent = options.errorComponent || null;
	const loadingComponent = options.loadingComponent || null;

	function resolve(location: RouteLocation): RouteResolved<Meta> | null {
		if (typeof location === 'string') {
			return resolveRouteByPath(routes, location);
		}

		const route = resolveRouteByName(routes, location.name);

		if (route) {
			const params = location.params || {};
			validateParams(route, params);
			return { route, params };
		}

		return null;
	}

	async function push(location: RouteLocation): Promise<void> {
		const resolved = resolve(location);

		if (resolved) {
			await navigate(resolved);
		}
	}

	async function navigate(to: RouteResolved<Meta>) {
		const current = get_store_value(currentRoute);

		if (current && current.route === to.route) return false;

		const guards = beforeEach.concat(to.route.beforeEnter);
		for (const guard of guards) {
			const result = await guard(to, current || null);
			if (result === false) return false;
			if (typeof result === 'string' || typeof result === 'object') {
				const resolved = resolve(result);
				if (resolved) {
					if (resolved.route.getPath(resolved.params) === to.route.getPath(to.params))
						throw new Error('Redirected to the same route, this would cause an infinite loop');
					await navigate(resolved);
				}
				return false;
			}
		}

		currentRoute.set(to);
		return true;
	}

	const router = {
		mode,
		modeHandler,
		base,
		routes,
		beforeEach,
		afterEach,
		currentRoute,
		history,
		resolve,
		push,
		errorComponent,
		loadingComponent
	};

	modeHandler.init(router);
	currentRoute.subscribe((route) => route && modeHandler.update(router, route));

	return router;
}
