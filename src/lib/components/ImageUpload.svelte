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
		'flex w-full aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4 transition duration-300 ease-in-out hover:bg-gray-100',
		dragging && 'border-blue-500 bg-blue-100'
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

	<div class="relative flex w-full h-full items-center justify-center">
		<div class={cn('absolute flex flex-col items-center justify-center', src && 'hidden')}>
			<p class="mb-2 text-sm text-gray-600">
				<span class="font-semibold">Click to upload</span> or
				<span class="font-semibold">drag and drop</span>
			</p>
			<p class="text-sm text-gray-600">Supported formats: SVG, PNG & JPG</p>
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
