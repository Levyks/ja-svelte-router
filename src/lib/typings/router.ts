import type { ComponentType, SvelteComponentTyped } from 'svelte';
import type { Writable } from 'svelte/store';
import type { ComponentImporter } from './misc';

export type RouterMode = 'hash' | 'history';

export type CreateRouterOptions<Meta = unknown> = {
	mode?: RouterMode;
	base?: string;
	routes: RouteDefinition<Meta>[];
	beforeEach?: RouteGuard<Meta>[];
	afterEach?: RouteGuard<Meta>[];
	loadingComponent?: ComponentType;
	errorComponent?: ComponentType<SvelteComponentTyped<{ retry: () => void; error: Error }>>;
};

export type RouteDefinitionBase<Meta = unknown> = {
	path: string;
	name?: string;

	layout?: ComponentType;
	layoutImporter?: ComponentImporter;
	layoutProps?: Record<string, unknown>;
	useParentLayout?: boolean;

	componentProps?: Record<string, unknown>;

	beforeEnter?: RouteGuard<Meta>[];
	afterEnter?: RouteGuard<Meta>[];

	children?: RouteDefinition<Meta>[];
	meta?: Meta;
};

export type RouteDefinitionComponent<Meta = unknown> = RouteDefinitionBase<Meta> & {
	component: ComponentType;
	componentImporter?: never;
};

export type RouteDefinitionComponentImporter<Meta = unknown> = RouteDefinitionBase<Meta> & {
	component?: never;
	componentImporter: ComponentImporter;
};

export type Params = Record<string, string | undefined>;

export type RouteDefinition<Meta = unknown> =
	| RouteDefinitionComponent<Meta>
	| RouteDefinitionComponentImporter<Meta>;

export type RouteLocation = string | { name: string; params?: Params };

export type Route<Meta = unknown> = {
	path: string;
	pathRegex: RegExp;
	pathParams: string[];
	getPath: (params: Params) => string;

	name: string | null;

	_layout: ComponentType | null;
	getLayout: () => Promise<ComponentType | null>;
	layoutProps: Record<string, unknown>;
	useParentLayout: boolean;

	_component: ComponentType | null;
	getComponent: () => Promise<ComponentType>;
	componentProps: Record<string, unknown>;

	beforeEnter: RouteGuard<Meta>[];
	afterEnter: RouteGuard<Meta>[];

	parent: Route<Meta> | null;
	children: Route<Meta>[];

	meta: Meta | null;
};

export type RouteResolved<Meta = unknown> = {
	route: Route<Meta>;
	params: Params;
};

type RouteGuardReturnType = RouteLocation | boolean | undefined | void;
export type RouteGuard<Meta = unknown> = (
	to: RouteResolved<Meta>,
	from: RouteResolved<Meta> | null
) => RouteGuardReturnType | Promise<RouteGuardReturnType>;

export type Router<Meta = unknown> = {
	mode: RouterMode;
	modeHandler: Mode;
	base: string;
	routes: Route<Meta>[];
	beforeEach: RouteGuard<Meta>[];
	afterEach: RouteGuard<Meta>[];
	currentRoute: Writable<RouteResolved<Meta> | null>;
	resolve: (location: RouteLocation) => RouteResolved<Meta> | null;
	push: (to: RouteLocation) => Promise<void>;
	loadingComponent: ComponentType | null;
	errorComponent: ComponentType<SvelteComponentTyped<{ retry: () => void; error: Error }>> | null;
};

export type Context<Meta = unknown> = {
	getRouter: () => Router<Meta>;
};

export type Mode = {
	init: <Meta = unknown>(router: Router<Meta>) => void;
	update: <Meta = unknown>(router: Router<Meta>, resolved: RouteResolved<Meta>) => void;
};
