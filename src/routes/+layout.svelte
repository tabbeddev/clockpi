<script>
	import "$lib/app.css";
	import Clock from "$lib/components/Clock.svelte";
	let { children } = $props();
</script>

{@render children()}