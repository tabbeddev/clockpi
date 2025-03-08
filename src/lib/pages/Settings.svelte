<script>
	import alarm from "$lib/assets/alarm.wav";
	import notification from "$lib/assets/notification.wav";

	import Left from "$lib/components/icons/Left.svelte";
	import Right from "$lib/components/icons/Right.svelte";
	import Settings from "$lib/components/icons/Settings.svelte";
	import Close from "$lib/components/icons/Close.svelte";
	import TimeEnter from "$lib/components/TimeEnter.svelte";
	import Clock from "$lib/components/icons/Clock.svelte";
	import NoClock from "$lib/components/icons/NoClock.svelte";
	import Bell from "$lib/components/icons/Bell.svelte";
	import NoBell from "$lib/components/icons/NoBell.svelte";
	import Play from "$lib/components/icons/Play.svelte";
	import { convWeekName, listWeekNames } from "$lib/modules/date_util";
	import { fade } from "svelte/transition";
	import resolveMediaPath from "$lib/modules/get_media_path";

	function createAlarmNotification(time) {
		const configKey = pageNumber == 11 ? config.alarms : config.notifications;
		configKey.push({
			hour: Number(time[0]),
			minute: Number(time[1]),
			disabled: false,
			repeat: $state.snapshot(createAlarm_days),
		});
		pageNumber = pageNumber == 11 ? 1 : 3;
		createAlarm_days.length = 0;
	}

	function testplay(media) {
		let path;
		if (media == "Default") {
			path = pageNumber == 2 ? alarm : notification;
		} else {
			path = resolveMediaPath(media);
		}
		const a = new Audio(path);
		a.play();
		a.addEventListener("timeupdate", () => {
			if (Math.round(a.currentTime) == 5) {
				a.pause();
			}
		});
	}

	function handleLeftNav() {
		if (pageNumber == 11) {
			pageNumber = 1;
		} else if (pageNumber == 12) {
			pageNumber = 3;
		} else {
			pageNumber--;
		}
	}

	const { config, closeSettings } = $props();
	const pageTitles = [
		"Appearance",
		"Alarms",
		"Alarm ringtone",
		"Notifications",
		"Notification sound",
		"Nightmode",
		"",
		"",
		"",
		"",
		"",
		"Create Alarm",
		"Create Notification",
	];

	const weekdays = listWeekNames();

	const createAlarm_days = $state([]);

	let pageNumber = $state(0);
</script>

{#snippet theme(disp_name, name)}
	<button
		type="button"
		class="select"
		disabled={config.theme == name}
		onclick={() => {
			config.theme = name;
		}}>{disp_name}</button
	>
{/snippet}

{#snippet alarmList(configKey, text, EnabledIcon, DisabledIcon)}
	{#if configKey.length}
		{#each configKey as alarm, index}
			<div class="flex justify-between items-center">
				<div class="flex items-center">
					{#if alarm.disabled}
						<DisabledIcon />
					{:else}
						<EnabledIcon />
					{/if}
					<p>
						<span class="text-3xl"
							>{new Date(0, 0, 0, alarm.hour, alarm.minute).toLocaleTimeString(
								undefined,
								{ hour: "numeric", minute: "2-digit" },
							)}</span
						><br />{convWeekName(alarm.repeat) || "Does not repeat"}
					</p>
				</div>
				<div>
					<button
						type="button"
						onclick={() => {
							configKey[index].disabled = !alarm.disabled;
						}}>{alarm.disabled ? "Enable" : "Disable"}</button
					>
					<button
						type="button"
						onclick={() => {
							configKey.splice(index, 1);
						}}>Delete</button
					>
				</div>
			</div>
			<hr />
		{/each}
	{:else}
		<p class="text-2xl">No {text} are created</p>
		<hr />
	{/if}
{/snippet}

<div class="flex justify-between items-center">
	{#if pageNumber == 0}
		<div class="spacebox"></div>
	{:else if pageNumber > 10}
		<Close onclick={handleLeftNav} />
	{:else}
		<Left onclick={handleLeftNav} />
	{/if}

	{#key pageNumber}
		<h2 in:fade>{pageTitles[pageNumber]}</h2>
	{/key}
	<div class="ruby">
		{#if pageNumber <= 4}
			<Right
				onclick={() => {
					pageNumber++;
				}}
			/>
		{/if}
		<Settings onclick={closeSettings} />
	</div>
</div>
<hr />

<!-- Apperearance -->
{#if pageNumber == 0}
	<h3>Theme:</h3>
	{@render theme("Cyan", "blue")}
	{@render theme("Purple", "purple")}
	{@render theme("Black", "black")}
	<br />
	{@render theme("Light blue", "lightblue")}
	{@render theme("Gray", "gray")}
	{@render theme("White", "white")}
	<hr />
	<h3>Show seconds:</h3>
	<button
		type="button"
		onclick={() => {
			config.showSeconds = !config.showSeconds;
		}}>{config.showSeconds ? "On" : "Off"}</button
	>

	<!-- Alarm list -->
{:else if pageNumber == 1}
	{@render alarmList(config.alarms, "alarms", Clock, NoClock)}
	<button
		type="button"
		onclick={() => {
			pageNumber = 11;
		}}>Create Alarm</button
	>

	<!-- Notification list -->
{:else if pageNumber == 3}
	{@render alarmList(config.notifications, "notifications", Bell, NoBell)}
	<button
		type="button"
		onclick={() => {
			pageNumber = 12;
		}}>Create Notification</button
	>

	<!-- Select Alarm Ringtone -->
{:else if pageNumber == 2 || pageNumber == 4}
	{#each ["Default", ...config.media] as media}
		<div class="flex items-center">
			<button
				type="button"
				onclick={() => {
					config[pageNumber == 2 ? "alarmRingtone" : "notiRingtone"] = media;
				}}
				disabled={(pageNumber == 2
					? config.alarmRingtone
					: config.notiRingtone) == media}>Use</button
			>
			<button
				type="button"
				class="!min-w-0 !p-0"
				onclick={() => {
					testplay(media);
				}}><Play /></button
			>
			<span class="text-2xl">{media}</span>
			<br />
		</div>
	{/each}

	<!-- Nightmode -->
{:else if pageNumber == 5}
	<h2>Sorry. Work in progress!</h2>

	<!-- Create Alarm Page -->
{:else if pageNumber == 11 || pageNumber == 12}
	<div class="flex justify-evenly">
		<TimeEnter
			confirmText={"Create " + (pageNumber == 11 ? "Alarm" : "Notification")}
			onConfirm={createAlarmNotification}
		/>
		<div class="max-w-1/2">
			<h3>On every:</h3>
			{#each Object.entries(weekdays) as day}
				<button
					type="button"
					class="select"
					disabled={createAlarm_days.includes(Number(day[0]))}
					onclick={() => {
						createAlarm_days.push(Number(day[0]));
					}}>{day[1]}</button
				>
			{/each}
			<br />
			<button
				type="button"
				class="select"
				disabled={createAlarm_days.length == 0}
				onclick={() => {
					createAlarm_days.length = 0;
				}}>Just once</button
			>
		</div>
	</div>
{/if}
