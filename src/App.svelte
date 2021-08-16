<script>
	import CitySearch from './components/CitySearch.svelte';
	import Card from './components/Card.svelte';

	let appname = 'WEATHER BUDDY';
	let cityList = [];
	let searchCity;
	let searchResults = [
	'Florianópolis',
	'Porto Velho',
	'London',
	'Caxias do Sul',
	'Crestview'
	];
</script>
<style>
	hr.divider {
		border-top-width: 1px;
		border-top-color: rgb(0 0 0 / 30%);
	}
</style>
<div class="container py-5 px-5">
	<!--App header-->
	<div class="row justify-content-center">
		<div class="col-lg-3 col-sm-1" />
		<div class="col-lg-6 col-sm-12 align-self-center">
			<h3 class="text-center">{appname}</h3>
			<hr class="divider">
		</div>
		<div class="col-lg-3 col-sm-1" />
	</div>
	<!--Search weather by city-->
	<div class="row justify-content-center">
		<CitySearch />
	</div>
	<!--Middle screen card or search error mes	sage-->
	<div class="row justify-content-center">
		{#if searchResults.length > 0}
			<Card cityName={searchResults[0]}/>
			{:else}
			<h3>Sorry. We couldn't find the specified city.</h3>
		{/if}
	</div>
	<!--Card deck-->
	<div class="row justify-content-center background-success">
		{#each searchResults as  city }
			<Card cityName={city}/>
		{/each}
	</div>
</div>
