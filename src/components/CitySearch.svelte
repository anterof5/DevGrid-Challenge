<script>
  import { onMount } from 'svelte';
  import { key } from '../key.js';

	let how = 'How is the weather in';
  let now = 'now';
  let cityName;
  export let searchResults;
  let cityList;

  onMount(() => cityName.focus())

  function getFetchUrl(searchCity) {
			return 'http://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + key + '&q=' + searchCity;
	}
	async function addWeatherInfo() {
    const res = await fetch(getFetchUrl(cityName));
    if (res.status === 404) {
        console.log('Invalid City Name.');
    } else {
				let data = await res.json()
        //cityList.push(data);
        console.log(data.json());
    }
    cityName = '';
	}
</script>
<style>
  input.cityInput{
    border: 0;
    outline: 0;
    border-bottom: 0.1px solid gray;
  }
</style>
<h3>
  {how} <input bind:value={cityName} on:change={addWeatherInfo(cityName)}  class="focusedInput cityInput" type="text"/> {now}
</h3>
