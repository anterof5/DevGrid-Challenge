<script>
  import { onMount } from 'svelte'
	let how = 'How is the weather in';
  let now = 'now';
  let cityName
  onMount(() => cityName.focus())

</script>
<style>
input.cityInput{
  border: 0;
  outline: 0;
  border-bottom: 0.1px solid gray;
}
</style>
<div class="row justify-content-center h-100">
  <h3>
  {how} <input bind:this={cityName}  class="focusedInput cityInput" type="text"/> {now}
  </h3>
</div>
