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
	class="lucide lucide-alarm-clock mr-2"
	><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path
		d="M5 3 2 6"
	/><path d="m22 6-3-3" /><path d="M6.38 18.7 4 21" /><path
		d="M17.64 18.67 20 21"
	/></svg
>
