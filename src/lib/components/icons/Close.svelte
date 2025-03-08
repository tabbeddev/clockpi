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
	class="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
>
