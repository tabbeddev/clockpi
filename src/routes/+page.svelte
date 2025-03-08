<script>
	import Clock from "$lib/components/Clock.svelte";
	import Spinner from "$lib/components/Spinner.svelte";
	import awaitMessage from "$lib/modules/await_websocket";
	import connectWebSocket from "$lib/modules/websocket";
	import MainPage from "$lib/pages/Main.svelte";

	function handleError(err) {
		error = err;
	}

	function setupCloseHandler(ws) {
		ws.addEventListener("close", () => {
			error = {
				message: "WebSocket closed unexpectedly",
				filename: "http://example.com/src/routes/+page.svelte",
				lineno: "<",
				colno: ">",
			};
		});
	}

	let error = $state();
	const config_request = JSON.stringify({
		type: "get-configs",
		config_keys: [
			"theme",
			"showSeconds",
			"alarmRingtone",
			"notiRingtone",
			"alarms",
			"notifications",
		],
	});

	console.log("Welcome to ClockPi 2. Press ALT to enable the cursor mode.");
</script>

<svelte:head>
	<title>ClockPi 2</title>
</svelte:head>
<svelte:window onerror={handleError} />

{#if error}
	<bg class="black cursor">
		<div class="centered max-w-2/3">
			<Spinner text="An error occured!" invert={false} />
			<p>Please reload the page to avoid further problems.</p>
			<button type="button" onclick={() => location.reload()}
				>Reload page</button
			>
			<button
				type="button"
				onclick={() => {
					error = undefined;
				}}>Continue anyways</button
			>
			<h2>More details:</h2>
			<p class="font-mono">
				{error.message} @ {new URL(error.filename).pathname} : {error.lineno}:{error.colno}
			</p>
			<span class="underline"
				>Please report this issue <a
					href="https://github.com/Niklas20114552/clockpi/issues"
					target="_blank"
					class="text-blue-500">here.</a
				><br />Please also see the console for more details.</span
			>
		</div>
	</bg>
{/if}

{#if !error}
	{#await connectWebSocket("ws://localhost:8109")}
		<bg class="black cursor">
			<div class="centered">
				<Clock showSeconds={true} />
				<Spinner text="Loading ClockPi 2..." />
			</div>
		</bg>
	{:then websocket}
		{setupCloseHandler(websocket)}
		{#await awaitMessage(websocket, config_request)}
			<bg class="black cursor">
				<div class="centered">
					<Clock showSeconds={true} />
					<Spinner text="Loading config..." />
				</div>
			</bg>
		{:then response}
			<MainPage {websocket} init_message={response} />
		{/await}
	{:catch}
		<bg class="white cursor">
			<div class="centered">
				<Clock showSeconds={true} />
				<Spinner text="Failed to connect!" invert={false} />
				<button type="button" onclick={() => location.reload()}
					>Reload page</button
				>
			</div>
		</bg>
	{/await}
{/if}
