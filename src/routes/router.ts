import { createRouter } from '$lib/router';

const router = createRouter({
	routes: [
		{
			path: '/',
			name: 'home',
			layoutImporter: () => import('./Layout.svelte'),
			componentImporter: () => import('./Home.svelte'),
			children: [
				{
					path: '/books',
					name: 'books',
					useParentLayout: false,
					componentImporter: () => import('./Books.svelte'),
					children: [
						{
							path: '/:id',
							name: 'book',
							beforeEnter: [],
							componentImporter: () => import('./BookDetail.svelte')
						}
					]
				},
				{
					path: '*',
					name: 'not-found',
					componentImporter: () => import('./NotFound.svelte')
				}
			]
		}
	]
});

console.log({ router });

export { router };
