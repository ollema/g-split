<script lang="ts">
	const outline = false;
</script>

<div class="w-full max-w-lg text-neutral-400">
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="95.185 73.83 219.193 20.943" width="100%">
		{#if outline}
			<!-- fill -->
			<text font-size="28px" font-family="Bergan" x="94.659" y="93.76" fill="#262626">
				G-SPLIT.BEER
			</text>
			<!-- stroke -->
			<text font-size="28px" font-family="BerganOutline" x="94.659" y="93.76" fill="currentColor">
				G-SPLIT.BEER
			</text>
		{:else}
			<!-- combined -->
			<text font-size="28px" font-family="Bergan" x="94.659" y="93.76" fill="#262626" stroke="currentColor" stroke-width="0.5">
				G-SPLIT.BEER
			</text>
		{/if}
	</svg>
</div>
