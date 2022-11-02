<script lang="ts">
	import { getContext } from 'svelte';
	import { key } from '$lib/router';

	import BlankLayout from './BlankLayout.svelte';

	import type { Context, RouteResolved } from '$lib/typings';

	type Meta = $$Generic<unknown>;
	export let resolved: RouteResolved<Meta>;

	const { getRouter } = getContext<Context<Meta>>(key);

	const router = getRouter();

	$: route = resolved.route;
	$: params = resolved.params;

	$: layoutPromise = route.getLayout().then((layout) => layout || BlankLayout);
	$: componentPromise = route.getComponent();

	function retryLayout() {
		layoutPromise = route.getLayout().then((layout) => layout || BlankLayout);
	}

	function retryComponent() {
		componentPromise = route.getComponent();
	}
</script>

{#await layoutPromise}
	{#if router.loadingComponent}
		<svelte:component this={router.loadingComponent} />
	{/if}
{:then layout}
	<svelte:component this={layout}>
		{#await componentPromise}
			{#if router.loadingComponent}
				<svelte:component this={router.loadingComponent} />
			{/if}
		{:then component}
			<svelte:component this={component} {...params} />
		{:catch error}
			{#if router.errorComponent}
				<svelte:component this={router.errorComponent} {error} retry={retryComponent} />
			{/if}
		{/await}
	</svelte:component>
{:catch error}
	{#if router.errorComponent}
		<svelte:component this={router.errorComponent} {error} retry={retryLayout} />
	{/if}
{/await}
