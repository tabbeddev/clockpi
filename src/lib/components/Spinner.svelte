<script>
    import spinner from "$lib/assets/spinner.gif";
    import { fade } from "svelte/transition";

    const { text = undefined, invert = true } = $props();
</script>

<div class="flex items-center justify-center">
    <img src={spinner} alt="loading" class="size-24" class:invert height="64" />
    <span class="text-3xl" in:fade>{text}</span>
</div>
