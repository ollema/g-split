<script lang="ts">
	import BoundingBoxOverlay from '$lib/components/BoundingBoxOverlay.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import { detect } from '$lib/models/object_detection/detect';
	import type { BoundingBox } from '$lib/types';
	import type { JimpInstance } from 'jimp';

	let src: string | undefined = $state(undefined);
	let bboxes: BoundingBox[] = $state([]);
	let latency: number[] | undefined = $state(undefined);
	let image: JimpInstance | undefined = $state(undefined);

	let detections = $derived.by(async () => {
		if (!src) return undefined;
		const result = await detect(src, 'cup');
		if (result) {
			bboxes = result.bboxes;
			latency = result.latency;
			image = result.image;
			return result;
		}
	});
</script>

<h1 class="mx-auto w-min whitespace-nowrap font-display text-5xl">G-SPLIT.BEER</h1>

<div class="mx-auto h-screen max-w-md">
	<ImageUpload bind:src>
		<BoundingBoxOverlay {bboxes} {image} />
	</ImageUpload>

	{#if src}
		{#await detections}
			<p>Processing image...</p>
		{:then}
			{#if bboxes.length > 0 && latency !== undefined}
				<div>
					<p>Number of detections: {bboxes.length}</p>
					<p>Inference latency: {latency[0].toFixed(3)}s</p>
					<p>Postprocessing latency: {latency[1].toFixed(3)}s</p>
				</div>
			{/if}
			{#each bboxes as bbox}
				{#if bbox.patch}
					{#await bbox.patch.clone().resize({ w: 256, h: 256 }).getBase64('image/png') then base64}
						<img src={base64} alt="Detected object" />
					{:catch error}
						<p>{error.message}</p>
					{/await}
				{/if}
			{/each}
		{:catch error}
			<p>{error.message}</p>
		{/await}
	{/if}
</div>
