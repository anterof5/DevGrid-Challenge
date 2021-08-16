<script>
	import CitySearch from './components/CitySearch.svelte';
	import Card from './components/Card.svelte';
	let appname = 'Weather Buddy';
</script>
<style>
	hr.divider {
		border-top-width: 1px;
		border-top-color: rgb(0 0 0 / 30%);
	}
</style>
<div class="container py-5">
	<!--App header-->
	<div class="row justify-content-center">
		<div class="col-3" />
		<div class="col-6 align-self-center">
			<h1 class="text-center">{appname}</h1>
			<hr class="divider">
		</div>
		<div class="col-3" />
	</div>
	<!--Search weather by city-->
	<div class="row py-3 justify-content-center">
		<CitySearch />
	</div>
	<!--Middle screen card-->
	<div class="row py-3 justify-content-center">
		<Card />
	</div>
	<!--Card deck-->
	<div class="row py-3 justify-content-center">
				<Card />
				<Card />
				<Card />
				<Card />
				<Card />
	</div>
</div>
