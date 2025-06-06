<script lang="ts">
	import CurrentLayout from '$lib/components/CurrentLayout.svelte';
	import Settings from 'lucide-svelte/icons/settings';
</script>

<div class="flex h-full w-full flex-grow flex-row overflow-hidden">
	<div
		class="flex flex-shrink flex-col overflow-hidden border-r border-gray-300 dark:border-gray-600"
	>
		<div class="flex flex-grow flex-col overflow-y-auto overflow-x-hidden"></div>
		<div class="flex flex-shrink flex-col overflow-y-auto overflow-x-hidden">
			<button class="btn icon">
				<Settings />
			</button>
		</div>
	</div>
	<div class="flex flex-grow flex-col overflow-hidden">
		<CurrentLayout />
	</div>
</div>
