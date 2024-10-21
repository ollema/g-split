<script lang="ts">
	import { WIDTH, HEIGHT, type BoundingBox } from '$lib/models/object_detection/detect';

	let { bboxes }: { bboxes: BoundingBox[] } = $props();

	let canvas: HTMLCanvasElement;

	function updateCanvas() {
		if (document && canvas && bboxes) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
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
					ctx.strokeRect(x, y, width, height);
					ctx.fillText(label, x, y - 5);
				});
			}
		}
	}

	$effect(() => {
		if (bboxes) {
			updateCanvas();
		}
	});
</script>

<canvas class="absolute left-0 top-0 h-full w-full" bind:this={canvas}></canvas>
