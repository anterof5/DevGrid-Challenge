<script>
  import { onMount } from 'svelte';
  import { key } from '../key.js';
  import { weatherList } from '../store.js';

	let how = 'How is the weather in';
  let now = 'now';
  let cityName = '';
  let cityList;

  function getFetchUrl(searchCity) {
			return 'http://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + key + '&q=' + searchCity;
	}
	async function addWeatherInfo() {
    const res = await fetch(getFetchUrl(cityName));
    if (res.status === 404) {
        console.log('Invalid City Name.');
    } else {
				let data = await res.json()
        weatherList.add(await data);
        console.log(weatherList);

    }
    cityName = '';
	}
</script>
<style>
  input.cityInput{
    border: 0;
    outline: 0;
    margin-left: 10px;
    border: 0.1px solid gray;
  }
</style>
<h3>
  <div class="input-group mb-3">
  {how} <input bind:value={cityName} class="focusedInput cityInput" type="text" autofocus/>
  <div class="input-group-prepend">
      <button class="btn btn-outline-secondary" type="button"
      on:click={addWeatherInfo(cityName)}>
      Now
      </button>
  </div>
</div>
</h3>
