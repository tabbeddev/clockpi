<script>
	import Left from "$lib/components/icons/Left.svelte";
	import MusicFile from "$lib/components/icons/MusicFile.svelte";
	import Right from "$lib/components/icons/Right.svelte";

	const { websocket, msg } = $props();
	const mediaURL = new URL(location);
	mediaURL.port = "8109";
	mediaURL.pathname = "/";

	function openPopup(item) {
		window.open(
			mediaURL.href + "media/" + item,
			"popup",
			"width=400;height=200",
		);
	}

	async function deleteItem(item) {
		if (confirm("Do you really want to delete " + item + "?")) {
			const response = await fetch(mediaURL.href + item, { method: "DELETE" });

			if (!response.ok) {
				alert(`Failed to delete ${item}: ${await response.text()}`);
			}
		}
	}

	function handleUpload(event) {
		const files = event.target.files;

		for (const file of files) {
			const reader = new FileReader();
			reader.onload = async (e) => {
				const response = await fetch(mediaURL.href + file.name, {
					method: "POST",
					body: e.target.result,
				});

				if (!response.ok) {
					alert(`Failed to upload ${file.name}: ${await response.text()}`);
				}
			};
			reader.readAsArrayBuffer(file);
		}
	}

	let media = $state(JSON.parse(msg).values.media);

	websocket.addEventListener("message", (ev) => {
		const json = JSON.parse(ev.data);

		if (json.type == "media") {
			console.log("New media arrived: " + json);
			media = json.media;
		} else {
			console.warn("Unkown message: " + json);
		}
	});

	const pageTitles = ["Media Management"];
	let pageNumber = $state(0);
</script>

<div class="centered top">
	<h1 class="clock">ClockPi 2</h1>
</div>

<div class="bottombar expanded">
	<div class="flex justify-between items-center">
		{#if pageNumber == 0}
			<div class="spacebox"></div>
		{:else}
			<Left onclick={handleLeftNav} />
		{/if}

		{#key pageNumber}
			<h2 in:fade>{pageTitles[pageNumber]}</h2>
		{/key}

		{#if pageNumber == pageTitles.length - 1}
			<div class="spacebox"></div>
		{:else}
			<Right
				onclick={() => {
					pageNumber++;
				}}
			/>
		{/if}
	</div>
	<hr />

	{#each media as item, index}
		<div class="flex justify-between items-center">
			<div style:display="inherit">
				<MusicFile />
				<span class="text-2xl">{item}</span>
			</div>
			<div style:display="inherit">
				<button type="button" onclick={() => openPopup(item)}>Open</button>
				<button type="button" onclick={() => deleteItem(item)}>Delete</button>
			</div>
		</div>
		<hr />
	{/each}
	<label class="button">
		Upload file...
		<input
			type="file"
			onchange={handleUpload}
			multiple
			accept=".mp3,.wav,.m4a,.opus,.ogg"
		/>
	</label>
</div>
