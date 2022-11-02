import type { Params, Route, RouteResolved } from './typings';

export function resolveRouteByPath<Meta = unknown>(
	routes: Route<Meta>[],
	path: string
): RouteResolved<Meta> | null {
	for (const route of routes) {
		const match = path.match(route.pathRegex);

		if (match) {
			const params: Params = {};

			for (let i = 1; i < match.length; i++) {
				params[route.pathParams[i - 1]] = match[i];
			}

			return { route, params };
		}

		const result = resolveRouteByPath(route.children, path);

		if (result) {
			return result;
		}
	}

	return null;
}

export function resolveRouteByName<Meta = unknown>(
	routes: Route<Meta>[],
	name: string
): Route<Meta> | null {
	for (const route of routes) {
		if (route.name === name) {
			return route;
		}

		const result = resolveRouteByName(route.children, name);

		if (result) {
			return result;
		}
	}

	return null;
}
