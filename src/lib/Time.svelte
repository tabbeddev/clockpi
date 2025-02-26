<script>
    let { splitted_time } = $props();
    let changestate = $state(0);

    function changeTiming(digit) {
        splitted_time[changestate] =
            splitted_time[changestate].substring(1);

        splitted_time[changestate] += digit.toString();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
    class="boxed"
    class:selected={changestate == 0}
    onclick={() => {
        changestate = 0;
    }}>{splitted_time[0]}</span
>
:
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
    class="boxed"
    class:selected={changestate == 1}
    onclick={() => {
        changestate = 1;
    }}>{splitted_time[1]}</span
>
<br />
<br />
<button type="button" onclick={() => changeTiming(1)}>1</button>
<button type="button" onclick={() => changeTiming(2)}>2</button>
<button type="button" onclick={() => changeTiming(3)}>3</button>
<br />
<button type="button" onclick={() => changeTiming(4)}>4</button>
<button type="button" onclick={() => changeTiming(5)}>5</button>
<button type="button" onclick={() => changeTiming(6)}>6</button>
<br />
<button type="button" onclick={() => changeTiming(7)}>7</button>
<button type="button" onclick={() => changeTiming(8)}>8</button>
<button type="button" onclick={() => changeTiming(9)}>9</button>
<br />
<button type="button" onclick={() => changeTiming(0)}>0</button>
