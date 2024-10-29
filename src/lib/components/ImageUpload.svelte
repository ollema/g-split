<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		src = $bindable(),
		img = $bindable(),
		children
	}: { src?: string; img?: HTMLImageElement; children: Snippet } = $props();

	let dragging = $state(false);

	let input: HTMLInputElement;

	function handleDrag(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragging = e.type === 'dragenter' || e.type === 'dragover';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragging = false;
		if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
			handleFiles(e.dataTransfer.files);
		}
	}

	function handleChange(e: Event) {
		e.preventDefault();
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleFiles(target.files);
		}
	}

	function handleFiles(files: FileList) {
		const file = files[0];
		if (file.type.startsWith('image/')) {
			src = URL.createObjectURL(file);
		} else {
			alert('Please upload an image file');
		}
	}

	function onButtonClick() {
		input.click();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onButtonClick();
		}
	}
</script>

<div
	class={cn(
		'aspect-square w-full max-w-lg flex-shrink-0 cursor-pointer rounded-lg border border-neutral-400 bg-neutral-800 p-4 hover:brightness-110',
		dragging && 'border-blue-500 brightness-110'
	)}
	ondragenter={handleDrag}
	ondragleave={handleDrag}
	ondragover={handleDrag}
	ondrop={handleDrop}
	onclick={onButtonClick}
	onkeydown={handleKeyDown}
	role="button"
	tabindex="0"
>
	<input class="hidden" type="file" accept="image/*" onchange={handleChange} bind:this={input} />

	<div class="relative flex h-full w-full items-center justify-center">
		<div class={cn('absolute flex flex-col items-center justify-center', src && 'hidden')}>
			<p class="text-sm text-neutral-200">
				Click to upload or drag and drop
			</p>
		</div>

		<img
			class={cn('hidden h-full w-full object-contain object-center', src && 'block')}
			{src}
			alt="uploaded"
			bind:this={img}
		/>

		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
