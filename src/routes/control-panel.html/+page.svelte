<script>
	import Spinner from "$lib/components/Spinner.svelte";
	import awaitMessage from "$lib/modules/await_websocket";
	import connectWebSocket from "$lib/modules/websocket";
	import ControlPanel from "$lib/pages/ControlPanel.svelte";

	const url = new URL(location);
	url.protocol = url.protocol == "https" ? "wss" : "ws";
	url.pathname = "";
	url.port = 8109;
</script>

<svelte:head>
	<title>ClockPi 2 Control panel</title>
</svelte:head>

<bg class="black cursor">
	{#await connectWebSocket(url.href)}
		<div class="centered">
			<Spinner text="Connecting to ClockPi 2..." />
		</div>
	{:then websocket}
		{#await awaitMessage(websocket, JSON.stringify({ type: "get-configs", config_keys: [] }))}
			<div class="centered">
				<Spinner text="Loading media..." />
			</div>
		{:then msg}
			<ControlPanel {msg} {websocket} />
		{/await}
	{:catch}
		<div class="centered">
			<Spinner text="Failed to connect!" />
		</div>
	{/await}
</bg>
