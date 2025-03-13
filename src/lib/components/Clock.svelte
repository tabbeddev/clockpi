<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
		import { format } from "jsr:@std/datetime"

    const {
        onHour = undefined,
        onMinute = undefined,
        onSecond = undefined,
        showSeconds = false,
    } = $props();

    function getTime() {
        const d = new Date();

        onSecond && onSecond(d);

        if (d.getSeconds() == 0) {
            onMinute && onMinute(d);

            if (d.getMinutes() == 0) {
                onHour && onHour(d);
            }
        }

        return [
            d.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            }),
            format(d, "ss"),
        ];
    }

    onMount(() => {
        setInterval(() => {
            [time, seconds] = getTime();
        }, 1000);
    });

    let [time, seconds] = $state(getTime());
</script>

<h1 class="clock">{time}</h1>
{#if showSeconds}
    <h2 class="clock" in:fade out:fade>{seconds}</h2>
{/if}
