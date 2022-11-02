<script lang="ts">
	import { setContext } from 'svelte';
	import { key } from '$lib/router';
	import type { Router, Context } from '$lib/typings';
	import Route from './Route.svelte';

	type Meta = $$Generic<unknown>;
	export let router: Router<Meta>;

	setContext<Context<Meta>>(key, {
		getRouter: () => router
	});

	$: currentRouteStore = router.currentRoute;
	$: resolved = $currentRouteStore;
</script>

{#if resolved}
	<Route {resolved} />
{/if}
