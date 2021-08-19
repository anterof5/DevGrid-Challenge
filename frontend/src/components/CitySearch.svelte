<script>
  import { onMount } from 'svelte';
  import { key } from '../key.js';
  import { weatherList, showFirst } from '../store.js';

  // Variables
  let how = 'How is the weather in';
  let now = 'now';
  let cityName = '';
  let cityList;
  let alert = "Sorry. We couldn't find the specified city.";

  // Generate a url for API search
  function getFetchUrl(searchCity) {
    return 'http://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + key + '&q=' + searchCity;
  }

  // If have a valid city update weatherList, and show first city in middle of screen
  async function addWeatherInfo() {
    const res = await fetch(getFetchUrl(cityName));
    // If status = 404, hide first city and show error message;
    if (res.status === 404) {
      showFirst.set(false);
    }
    // Else, hide error message, show first city in middle of screen and update list;
    else {
      showFirst.set(true);
      let data = await res.json()
      // Only can have 5 results in array
      if ($weatherList.length < 5) {
        weatherList.add(await data);
      } else {
        weatherList.remove($weatherList[0]);
        weatherList.add(await data);
      }
    }
    cityName = '';
  }
</script>
<style>
  input.cityInput {
    border: 0;
    outline: 0;
    margin-left: 10px;
    border: 0.1px solid gray;
  }
</style>
<h3>
  <!--City name input-->
  <div class="input-group mb-3">
    {how} <input bind:value={cityName} class="cityInput" type="text" autofocus />
    <div class="input-group-prepend">
      <button class="btn btn-outline-secondary" type="button" on:click={addWeatherInfo(cityName)}>
        Now
      </button>
    </div>
  </div>

  <!--Search error message-->
  {#if $showFirst == false }
    <div class="row centerScreen">
      <div class="alert alert-danger" role="alert">
        {alert}
      </div>
    </div>
  {/if}
</h3>
