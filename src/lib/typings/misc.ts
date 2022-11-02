import type { SvelteComponentTyped, ComponentType } from 'svelte';

export type ComponentImporter<Component extends SvelteComponentTyped = SvelteComponentTyped> =
	() => Promise<{ default: ComponentType<Component> }>;
