<script>
	const {
		defaultTime = ["06", "00"],
		confirmText = "Confirm",
		onConfirm = () => {},
	} = $props();
	let splitted_time = $state(defaultTime);
	let changestate = $state(0);
	let status_msg = $state("");

	function changeTiming(digit) {
		splitted_time[changestate] = splitted_time[changestate].substring(1);

		splitted_time[changestate] += digit.toString();
	}

	function confirm() {
		if (splitted_time[0] > 23 || splitted_time[1] > 59 || splitted_time[0] < 0 || splitted_time[1] < 0) {
			return status_msg = "This is not a valid time!";
		}
		onConfirm(splitted_time);
	}
</script>

{#snippet button(number)}
	<button type="button" onclick={() => changeTiming(number)}>{number}</button>
{/snippet}

<div class="text-center">
	<button
		type="button"
		class:selected={changestate == 0}
		onclick={() => {
			changestate = 0;
		}}
		>{splitted_time[0]}
	</button>
	:
	<button
		type="button"
		class:selected={changestate == 1}
		onclick={() => {
			changestate = 1;
		}}
		>{splitted_time[1]}
	</button>

	<br />
	{@render button(1)}
	{@render button(2)}
	{@render button(3)}
	<br />
	{@render button(4)}
	{@render button(5)}
	{@render button(6)}
	<br />
	{@render button(7)}
	{@render button(8)}
	{@render button(9)}
	<br />
	{@render button(0)}
	<br />
	<span>{status_msg}</span>
	<br/>
	<button type="button" onclick={confirm}>{confirmText}</button>
</div>
