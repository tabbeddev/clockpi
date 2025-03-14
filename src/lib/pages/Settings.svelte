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
	import Lightbulb from "$lib/components/icons/Lightbulb.svelte";
	import NoLightbulb from "$lib/components/icons/NoLightbulb.svelte";
	import { convWeekName, listWeekNames } from "$lib/modules/date_util";
	import { fade } from "svelte/transition";
	import resolveMediaPath from "$lib/modules/get_media_path";
	function getCreateTitle() {
		if (pageNumber == 11) {
			return "Alarm";
		} else if (pageNumber == 12) {
			return "Notification";
		} else if (pageNumber == 13 || pageNumber == 14) {
			return "Event";
		}
	}

	function createAlarmNotification(time) {
		let configKey;
		if (pageNumber == 11) {
			configKey = config.alarms;
			pageNumber = 2;
		} else if (pageNumber == 12) {
			configKey = config.notifications;
			pageNumber = 4;
		} else if (pageNumber == 13) {
			configKey = config.nightmode_on;
			pageNumber = 7;
		} else if (pageNumber == 14) {
			configKey = config.nightmode_off;
			pageNumber = 8;
		}

		configKey.push({
			hour: Number(time[0]),
			minute: Number(time[1]),
			disabled: false,
			repeat: $state.snapshot(createAlarm_days).toSorted(),
		});
		createAlarm_days.length = 0;
	}

	function testplay(media) {
		let path;
		if (media == "Default") {
			path = pageNumber == 3 ? alarm : notification;
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
			pageNumber = 2;
		} else if (pageNumber == 12) {
			pageNumber = 4;
		} else {
			pageNumber--;
		}
	}

	const { config, closeSettings } = $props();
	const pageTitles = [
		"General",
		"Appearance",
		"Alarms",
		"Alarm ringtone",
		"Notifications",
		"Notification sound",
		"Nightmode",
		"Automatic nightmode (on)",
		"Automatic nightmode (off)",
		"",
		"",
		"Create Alarm",
		"Create Notification",
		"Create Nightmode (on) event",
		"Create Nightmode (off) event",
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

{#snippet font(disp_name, name)}
	<button
		type="button"
		class="select font-{name}"
		disabled={config.font == name}
		onclick={() => {
			config.font = name;
		}}
	>
		<span>
			{disp_name}
		</span>
	</button>
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
								{ hour: "2-digit", minute: "2-digit" },
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
		{#if pageNumber <= 7}
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
	<div class="ruby">
		<h3>Hour gong:</h3>
		<button
			type="button"
			onclick={() => {
				config.hourGong = !config.hourGong;
			}}>{config.hourGong ? "On" : "Off"}</button
		>
	</div>
	<hr />
	<div class="ruby">
		<h3>Pulse when alarm is ringing:</h3>
		<button
			type="button"
			onclick={() => {
				config.pulseAlarm = !config.pulseAlarm;
			}}>{config.pulseAlarm ? "On" : "Off"}</button
		>
	</div>
{:else if pageNumber == 1}
	<div class="ruby">
		<h3>Theme:</h3>
		{@render theme("Cyan", "blue")}
		{@render theme("Purple", "purple")}
		{@render theme("Black", "black")}
		{@render theme("Light blue", "lightblue")}
		{@render theme("Gray", "gray")}
		{@render theme("White", "white")}
	</div>
	<hr />
	<div class="ruby">
		<h3>Show seconds:</h3>
		<button
			type="button"
			onclick={() => {
				config.showSeconds = !config.showSeconds;
			}}>{config.showSeconds ? "On" : "Off"}</button
		>
	</div>
	<hr />
	<div class="ruby">
		<h3>Font:</h3>
		{@render font("Offside (default)", "offside")}
		{@render font("System font", "system")}
		{@render font("Gugi", "gugi")}
		{@render font("Iceberg", "iceberg")}
		{@render font("Orbitron", "orbitron")}
	</div>
	<hr />
	<h3>Brightness:</h3>

	<div class="table">
		<div class="table-row">
			<label for="bnnm" class="table-cell">Nightmode:&nbsp;</label>
			<input
				class="table-cell"
				name="bnnm"
				type="range"
				min="10"
				max="100"
				bind:value={config.nightBrightness}
			/>
		</div>
		<div class="table-row">
			<label for="bnno" class="table-cell">Normal:&nbsp;</label>
			<input
				class="table-cell"
				name="bnno"
				type="range"
				min="10"
				max="100"
				bind:value={config.normalBrightness}
			/>
		</div>
	</div>

	<!-- Alarm list -->
{:else if pageNumber == 2}
	{@render alarmList(config.alarms, "alarms", Clock, NoClock)}
	<button
		type="button"
		onclick={() => {
			pageNumber = 11;
		}}>Create Alarm</button
	>

	<!-- Notification list -->
{:else if pageNumber == 4}
	{@render alarmList(config.notifications, "notifications", Bell, NoBell)}
	<button
		type="button"
		onclick={() => {
			pageNumber = 12;
		}}>Create Notification</button
	>

	<!-- Select Alarm Ringtone -->
{:else if pageNumber == 3 || pageNumber == 5}
	{#each ["Default", ...config.media] as media}
		<div class="flex items-center">
			<button
				type="button"
				class="select"
				onclick={() => {
					config[pageNumber == 3 ? "alarmRingtone" : "notiRingtone"] = media;
				}}
				disabled={(pageNumber == 3
					? config.alarmRingtone
					: config.notiRingtone) == media}>Select</button
			>
			<button
				type="button"
				class="!min-w-0 !p-0"
				onclick={() => {
					testplay(media);
				}}><Play /></button
			>
			<span class="text-2xl"
				>{media.substring(0, 40)}{media.length > 40 ? "..." : ""}</span
			>
			<br />
		</div>
	{/each}

	<!-- Nightmode -->
{:else if pageNumber == 6}
	<div class="ruby">
		<h3>Use Black theme in Nightmode:</h3>
		<button
			type="button"
			onclick={() => {
				config.darkNightmode = !config.darkNightmode;
			}}
			>{config.darkNightmode ? "On" : "Off"}
		</button>
	</div>
	<hr />
{:else if pageNumber == 7}
	{@render alarmList(config.nightmode_on, "events", Lightbulb, NoLightbulb)}
	<button
		type="button"
		onclick={() => {
			pageNumber = 13;
		}}>Create Event</button
	>
{:else if pageNumber == 8}
	{@render alarmList(config.nightmode_off, "events", Lightbulb, NoLightbulb)}
	<button
		type="button"
		onclick={() => {
			pageNumber = 14;
		}}>Create Event</button
	>

	<!-- Create Alarm Page -->
{:else if 11 <= pageNumber || pageNumber <= 14}
	<div class="flex justify-evenly">
		<TimeEnter
			confirmText={"Create " + getCreateTitle()}
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
