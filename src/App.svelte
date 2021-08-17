<script>
	import { onMount } from "svelte";

	import CitySearch from './components/CitySearch.svelte';
	import Card from './components/Card.svelte';
	import AppHeader from './components/AppHeader.svelte';

	// Variables
	let appname = 'WEATHER BUDDY';
	let cityList = [];
	let searchCity = '';
	let searchResults;
	let alert = "Sorry. We couldn't find the specified city.";
	let showAlert = false;
	let showIcons = false;
	// Functions
	function removeCity(cityList, item) {
		delete cityList[item]
		alert(cityList)
	}

</script>
<!--App header-->
<div class="d-flex justify-content-center py-3">
	<AppHeader name={appname} />
</div>
<div class="row-full pt-5">
	<!--Search weather by city-->
	<div class="centerScreen">
		<div class="d-flex flex-wrap align-content-start">
			<CitySearch cityList={cityList}/>
		</div>
	</div>
	{cityList}
	<!--Middle screen card or search error message-->
	{#if cityList.length > 0}
	<div class="d-flex justify-content-center py-3">
			<Card cityName={searchCity} actionIcon="bi bi-plus-circle-fill"
			showIcons={showIcons} />
	</div>
	{/if}

	<!--Search error message-->
	{#if showAlert == true }
	<div class="d-flex justify-content-center py-3">
		<div class="centerScreen">
			<h3>{alert}</h3>
		</div>
	</div>
	{/if}

	<!--Card deck-->
	{#if cityList.length > 0}
	<div class="centerScreen">
		<div class="d-flex flex-wrap align-content-start">
			{#each cityList as  city }
				<Card cityName={city} actionIcon="bi bi-dash-circle-fill"
				showIcons={showIcons}/>
			{/each}
		</div>
	</div>
  {/if}
</div>
