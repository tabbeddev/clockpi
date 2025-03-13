<script>
	let isDown = false;
	let startX;
	let startY;
	let scrollLeft;
	let scrollTop;

	function onMouseDown(e) {
		const container = e.currentTarget;
		isDown = true;
		startY = e.pageY - container.offsetTop;
		scrollTop = container.scrollTop;
	}

	function onMouseUp() {
		isDown = false;
	}

	function onMouseMove(e) {
		if (!isDown) return;
		const container = e.currentTarget;
		const y = e.pageY - container.offsetTop;
		const deltaY = y - startY;
		if (Math.abs(deltaY) > 5) {
			// Toleranzgrenze von 5px
			container.scrollTop = scrollTop - deltaY * 1.5;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onmousedown={onMouseDown}
	onmouseup={onMouseUp}
	onmousemove={onMouseMove}
>
	<slot />
</div>

<style>
	div {
		overflow: scroll;
		overflow-x: hidden;
		overflow-y: overlay;

		height: 100%;
	}
</style>
