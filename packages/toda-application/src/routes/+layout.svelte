<script lang="ts" module>
	import '../app.css';
</script>

<script lang="ts">
	import Notifications from '$lib/components/Notifications.svelte';

	let { children } = $props();

	$effect(() => {
		// for testing to know that svelte has mounted
		document.body.classList.add('hydrated');
	});
</script>

{@render children()}

<Notifications />
