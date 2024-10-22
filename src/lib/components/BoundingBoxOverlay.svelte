<script lang="ts">
	import { WIDTH, HEIGHT } from '$lib/models/object_detection/detect';
	import type { BoundingBox } from '$lib/types';
	import type { JimpInstance } from 'jimp';

	let { bboxes, image }: { bboxes: BoundingBox[]; image?: JimpInstance } = $props();

	let canvas: HTMLCanvasElement;

	function updateCanvas() {
		if (document && canvas && bboxes && image) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
				// TODO: make this a function
				const scale = Math.max(image.width / WIDTH, image.height / HEIGHT);
				const xPadding = (WIDTH * scale - image.width) / 2;
				const yPadding = (HEIGHT * scale - image.height) / 2;

				canvas.width = WIDTH;
				canvas.height = HEIGHT;
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				// bounding box style
				ctx.strokeStyle = 'red';
				ctx.lineWidth = 2;

				// label style
				ctx.font = '16px Arial';
				ctx.fillStyle = 'green';

				bboxes.forEach(({ x, y, width, height, label }) => {
					ctx.strokeRect(
						(x + xPadding) / scale,
						(y + yPadding) / scale,
						width / scale,
						height / scale
					);
					ctx.fillText(label, (x + xPadding) / scale, (y + yPadding) / scale - 5);
				});
			}
		}
	}

	$effect(() => {
		if (bboxes && image) {
			updateCanvas();
		}
	});
</script>

<canvas class="absolute left-0 top-0 h-full w-full" bind:this={canvas}></canvas>
