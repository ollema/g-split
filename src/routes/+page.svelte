<script lang="ts">
	import BoundingBoxOverlay from '$lib/components/BoundingBoxOverlay.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import { detect, type BoundingBox } from '$lib/models/object_detection/detect';

	let src: string | undefined = $state(undefined);
	let bboxes: BoundingBox[] = $state([]);
	let latency: number[] | null = $state(null);

	let detections = $derived.by(async () => {
		if (!src) return undefined;
		const result = await detect(src, 'cup');
		if (result) {
			bboxes = result.bboxes;
			latency = result.latency;
			return result;
		}
	});
</script>

<div class="mx-auto mt-6 flex max-w-md flex-col items-center gap-4">
	<ImageUpload bind:src>
		<BoundingBoxOverlay {bboxes} />
	</ImageUpload>

	{#if src}
		{#await detections}
			<p>Processing image...</p>
		{:then}
			{#if bboxes.length > 0 && latency !== null}
				<div>
					<p>Number of detections: {bboxes.length}</p>
					<p>
						Latency: {#each latency as l}
							<span>{l.toFixed(3)}s</span>
						{/each}
					</p>
				</div>
			{/if}
		{:catch error}
			<p>{error.message}</p>
		{/await}
	{/if}
</div>
