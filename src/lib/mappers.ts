import type { Params, Route, RouteDefinition } from './typings';

export function parsePath<Meta = unknown>(
	path: string,
	parent: Route<Meta> | null
): {
	pathRegex: RegExp;
	pathParams: string[];
	getPath: (params: Params) => string;
} {
	const pathParams: string[] = [];
	const regexSource =
		path === '*'
			? '.*'
			: path.replace(/\/:(\w+)/g, (match, param) => {
					pathParams.push(param);

					return '/([^/]+)';
			  }) + '$';

	if (parent) {
		pathParams.push(...parent.pathParams);
	}

	const pathRegex = new RegExp(
		parent && parent.path !== '/' ? parent.pathRegex.source.slice(0, -1) + regexSource : regexSource
	);

	function getPath(params: Params) {
		const pathFilled = path.replace(/\/:(\w+)/g, (match, param) => {
			return '/' + (params[param] || '');
		});

		if (!parent || parent.path === '/') return pathFilled;
		return parent.getPath(params) + pathFilled;
	}

	return { pathRegex, pathParams, getPath };
}

export function mapRouteDefinition<Meta = unknown>(
	def: RouteDefinition<Meta>,
	parent: Route<Meta> | null
): Route<Meta> {
	const useParentLayout = def.useParentLayout !== undefined ? def.useParentLayout : true;

	function getLayout() {
		if (parent && useParentLayout) return parent.getLayout();

		if (def.layoutImporter) {
			return def.layoutImporter().then((module) => module.default);
		}

		return Promise.resolve(def.layout || null);
	}

	function getComponent() {
		if (def.componentImporter) {
			return def.componentImporter().then((module) => module.default);
		}

		return Promise.resolve(def.component!);
	}

	const route: Route<Meta> = {
		path: def.path,
		...parsePath<Meta>(def.path, parent),
		name: def.name || null,
		_layout: def.layout || null,
		getLayout,
		useParentLayout: def.useParentLayout || false,
		layoutProps: def.layoutProps || {},
		_component: def.component || null,
		getComponent,
		componentProps: def.componentProps || {},
		beforeEnter: def.beforeEnter || [],
		afterEnter: def.afterEnter || [],
		parent,
		children: [],
		meta: def.meta || null
	};

	if (def.children) {
		route.children = def.children.map((child) => mapRouteDefinition(child, route));
	}

	return route;
}

export function mapBaseUrl(baseUrl: string): string {
	if (baseUrl.endsWith('/')) return baseUrl;
	return baseUrl + '/';
}
