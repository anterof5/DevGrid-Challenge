<script>
	import { onMount } from "svelte";
	import CitySearch from './components/CitySearch.svelte';
	import Card from './components/Card.svelte';
	import AppHeader from './components/AppHeader.svelte';
	import { weatherList, showFirst } from './store.js';

	// Variables
	let appname = 'WEATHER BUDDY';
	let cityList = weatherList;
	let searchCity = '';
	let showIcons = false;

</script>
<!--App header-->
<div class="row justify-content-center pt-3">
	<AppHeader name={appname} />
</div>
<div class="row-full pt-5">
	<!--Search weather by city-->
	<div class="row justify-content-center py-3">
	<div class="centerScreen">
			<CitySearch/>
		</div>
	</div>
	<!--Middle screen card or search error message-->
	{#if $showFirst == true && $cityList.length > 0}
	<div class="row justify-content-center py-3">
			<Card cityName={$cityList[0]['name']}
				temp={$cityList[0]['main']['temp']}
				climate={$cityList[0]['weather'][0]['description']}
				weatherIcon={$cityList[0]['weather'][0]['icon']}
				actionIcon="bi bi-plus-circle-fill"
			showIcons={showIcons} />
	</div>
	{/if}

	<!--Card deck-->
	{#if $cityList.length > 0}
	<div class="centerScreen py-3">
	<div class="row justify-content-center">
		{#each $cityList as weather, index}
			<Card cityName={weather['name']}
				temp={weather['main']['temp']}
				climate={weather['weather'][0]['description']}
				weatherIcon={weather['weather'][0]['icon']}
				actionIcon="bi bi-plus-circle-fill"
			showIcons={showIcons} />
			{/each}
		</div>
	</div>
	{/if}
</div>
