<script>
	let { onclick = undefined } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
	{onclick}
	xlmns="http://www.w3.org/2000/svg"
	width="48"
	height="48"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6" /></svg
>
