<script>
	let { onclick = undefined } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<svg
	{onclick}
	xmlns="http://www.w3.org/2000/svg"
	width="40"
	height="40"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class="lucide lucide-alarm-clock-off mr-2"
	><path d="M6.87 6.87a8 8 0 1 0 11.26 11.26" /><path
		d="M19.9 14.25a8 8 0 0 0-9.15-9.15"
	/><path d="m22 6-3-3" /><path d="M6.26 18.67 4 21" /><path
		d="m2 2 20 20"
	/><path d="M4 4 2 6" /></svg
>
