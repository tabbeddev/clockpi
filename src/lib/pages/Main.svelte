<script>
	import resolveMediaPath from "$lib/modules/get_media_path";
	import defaultAlarm from "$lib/assets/alarm.wav";
	import defaultNotification from "$lib/assets/notification.wav";
	import gong from "$lib/assets/gong.wav";

	import SettingsPage from "$lib/pages/Settings.svelte";

	import Clock from "$lib/components/Clock.svelte";
	import Moon from "$lib/components/icons/Moon.svelte";
	import Settings from "$lib/components/icons/Settings.svelte";
	import { fade } from "svelte/transition";
	import { findNextAlarm, isToday } from "$lib/modules/date_util";
	import Close from "$lib/components/icons/Close.svelte";
	import Scrollable from "$lib/components/Scrollable.svelte";
	import ClockIcon from "$lib/components/icons/Clock.svelte";
	import loopAlarms from "$lib/modules/loop_alarms";

	let cursormode = $state(false);
	const { websocket, init_message } = $props();
	const config = $state({});

	handle_message(JSON.parse(init_message));

	let old_config = structuredClone($state.snapshot(config));

	let settings_mode = $state(false);
	let date = $state(toDate(new Date()));

	const alarm = new Audio();
	const notification = new Audio();
	alarm.src = resolveMediaPath(config.alarmRingtone, defaultAlarm);
	notification.src = resolveMediaPath(config.notiRingtone, defaultNotification);
	const gongAudio = new Audio(gong);

	let next_alarm = $state(findNextAlarm(config.alarms));
	let alarm_ringing = $state(false);

	let noti = $state();

	let nightmode = $state(false);
	let active_nightmode = $state(false);
	let activate_timeout;

	// Nightmode

	function wake() {
		if (!nightmode) return;

		active_nightmode = true;

		if (activate_timeout) {
			clearTimeout(activate_timeout);
		}

		activate_timeout = setTimeout(() => {
			if (!alarm_ringing) {
				active_nightmode = false;
			}
		}, 5000);
	}

	// Clockwork

	alarm.addEventListener("ended", () => {
		if (alarm_ringing) {
			alarm.play();
		}
	});

	function stopRinging() {
		if (nightmode && !activate_timeout) {
			wake();
		}

		alarm_ringing = false;
		alarm.pause();
	}

	function toDate(d) {
		return d.toLocaleDateString(undefined, {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}

	function onHour(d) {
		date = toDate(d);

		if (config.hourGong) {
      const max_plays = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
      for (let i = 0; i < max_plays; i++) {
        setTimeout(() => {
          gongAudio.play();
        }, i * 1500);
      }
		}
	}

	function onMinute(d) {
		// Alarms
		loopAlarms(
			d,
			config.alarms,
			(i) => {
				if (nightmode) {
					active_nightmode = true;
				}

				alarm_ringing = true;
				alarm.currentTime = 0;
				alarm.play();
			},
			alarm.paused,
		);

		// Notifications
		loopAlarms(
			d,
			config.notifications,
			(i) => {
				const not = config.notifications[i];
				const not_date = new Date();

				not_date.setHours(not.hour, not.minute, 0);
				noti = not_date.toLocaleTimeString(undefined, {
					hour: "numeric",
					minute: "2-digit",
				});

				if (!nightmode) {
					notification.play();
				}
			},
			notification.paused,
		);

		// Event on
		loopAlarms(
			d,
			config.nightmode_on,
			() => {
				nightmode = true;
				wake();
			},
			true,
		);

		// Event off
		loopAlarms(
			d,
			config.nightmode_off,
			() => {
				nightmode = false;
			},
			true,
		);
	}

	// Websocket

	function handle_message(msgJson) {
		switch (msgJson.type) {
			case "configs":
				for (const key of Object.entries(msgJson.values)) {
					config[key[0]] = key[1];
				}
				break;

			case "media":
				config.media = msgJson.media;
				break;

			default:
				throw new Error("Unknown message received!");
		}
	}

	websocket.addEventListener("message", (event) => {
		console.log("Message: " + event.data);
		handle_message(JSON.parse(event.data));
	});

	// Config handling

	function requestConfigs(keys) {
		websocket.send(JSON.stringify({ type: "get-configs", config_keys: keys }));
	}

	function syncConfig(config) {
		websocket.send(JSON.stringify({ type: "set-configs", config }));
	}

	$effect(() => {
		const { media, ...ommited_config } = config;
		const compared_config = Object.entries(ommited_config).reduce(
			(m, [k, e]) => {
				if (
					!old_config[k] ||
					JSON.stringify(old_config[k]) !== JSON.stringify(e)
				)
					m[k] = e;
				return m;
			},
			{},
		);
		if (Object.keys(compared_config).length !== 0) {
			syncConfig(compared_config);
			old_config = structuredClone($state.snapshot(ommited_config));
		}

		next_alarm = findNextAlarm(config.alarms);
	});

	$effect(() => {
		websocket.send(
			JSON.stringify({
				type: "bl-power",
				enabled: !nightmode || active_nightmode,
			}),
		);
	});

	$effect(() => {
		websocket.send(
			JSON.stringify({
				type: "brightness",
				data: nightmode ? config.nightBrightness : config.normalBrightness,
			}),
		);
	});

	$effect(() => {
		if (
			config.alarmRingtone !== "Default" &&
			!config.media.includes(config.alarmRingtone)
		)
			config.alarmRingtone = "Default";
		if (
			config.notiRingtone !== "Default" &&
			!config.media.includes(config.notiRingtone)
		)
			config.notiRingtone = "Default";

		alarm.src = resolveMediaPath(config.alarmRingtone, defaultAlarm);
		notification.src = resolveMediaPath(
			config.notiRingtone,
			defaultNotification,
		);
	});
</script>

<svelte:window
	onkeydown={(ev) => {
		if (ev.key == "Alt") cursormode = !cursormode;
	}}
	onclick={wake}
	onmousemove={wake}
/>

<bg
	class={[
		nightmode && config.darkNightmode ? "black" : config.theme,
		"font-" + config.font,
	]}
	class:cursor={cursormode}
	class:blackmode={nightmode && !active_nightmode}
	class:dimmed={active_nightmode}
	class:pulsing={alarm_ringing && config.pulseAlarm && nightmode}
>
	{#if !nightmode || active_nightmode}
		<div class="centered" class:top={settings_mode}>
			<Clock showSeconds={config.showSeconds} {onHour} {onMinute} />
			{#if alarm_ringing}
				<button type="button" onclick={stopRinging} class="min-h-fit ruby">
					<ClockIcon />
					Dismiss alarm
				</button>
			{:else if nightmode}
				<button
					type="button"
					onclick={() => {
						nightmode = false;
						active_nightmode = false;
					}}>Turn off Nightmode</button
				>
			{/if}
		</div>
	{/if}

	{#if nightmode && active_nightmode}
		<div class="bottombar !justify-center">
			<div class="bottomitem">
				{#if next_alarm && isToday(next_alarm)}
					<span
						>Next alarm is today at {next_alarm.toLocaleTimeString(undefined, {
							hour: "numeric",
							minute: "2-digit",
						})}</span
					>
				{:else if next_alarm}
					<span
						>Next alarm is at {next_alarm.toLocaleString(undefined, {
							weekday: "long",
							day: "numeric",
							month: "short",
							year: "numeric",
							hour: "numeric",
							minute: "2-digit",
						})}</span
					>
				{:else}
					<span>No alarm is set</span>
				{/if}
			</div>
		</div>
	{/if}
	{#if !nightmode}
		<div class="bottombar" class:expanded={settings_mode}>
			{#if settings_mode}
				<Scrollable>
					<SettingsPage
						{config}
						closeSettings={() => {
							settings_mode = false;
						}}
					/>
				</Scrollable>
			{:else if noti}
				<div class="bottomitem">Notification:</div>
				<div class="bottomitem">It's {noti}</div>
				<div class="bottomitem">
					<Close
						onclick={() => {
							noti = undefined;
						}}
					/>
				</div>
			{:else}
				<div class="bottomitem">
					<Moon
						onclick={() => {
							nightmode = true;
						}}
					/>
				</div>
				<div class="bottomitem">{date}</div>
				<div class="bottomitem">
					<Settings
						onclick={() => {
							settings_mode = !settings_mode;
						}}
					/>
				</div>
			{/if}
		</div>
	{/if}
</bg>
