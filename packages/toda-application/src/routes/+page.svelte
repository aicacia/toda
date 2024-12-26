<script lang="ts">
	import Extension from '$lib/components/Extension.svelte';
	import { extensions } from '$lib/stores/extensions.svelte';

	const context = extensions['com.toda.default'];
</script>

{#if context}
	<Extension {context} />
{/if}
