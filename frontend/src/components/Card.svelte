<script>
  export let cityName;
  export let temp;
  export let climate;
  export let actionIcon;
  export let showIcons;
  export let weatherIcon;
</script>
<div class="card border-secondary  mx-2" style="width: 12rem;">
    <div class="card-body card-shadow ">
      <!-- Card title -->
      <h5 class="card-title text-centered">{cityName}</h5>
      <!-- Bootstrap icons -->
        <h1><img id="wicon" src="http://openweathermap.org/img/w/{weatherIcon}.png" alt="Weather icon"></h1>
      <!-- Temperature -->
      <h2 class="card-text">{Math.round(temp)}C°</h2>
      <!-- Climate -->
      <h6>{climate.charAt(0).toUpperCase() + climate.slice(1)}</h6>
      <!-- Action icons -->
      {#if showIcons==true}
        <a href="/" on:click={cityName}><i class="{actionIcon}"></i></a>
      {/if}
    </div>
</div>
