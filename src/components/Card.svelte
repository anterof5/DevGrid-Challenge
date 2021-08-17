<script>
  export let cityName;
  let weatherIcon = 'bi bi-cloud-rain';
  let temp = '22°C';
  let climate='Light rain';
  export let actionIcon;
  export let showIcons;
</script>
<div class="card border-secondary  mx-2" style="width: 12rem;">
    <div class="card-body card-shadow ">
      <!-- Card title -->
      <h5 class="card-title text-centered">{cityName}</h5>
      <!-- Bootstrap icons -->
      {#if showIcons==true}
        <h1><i class="{weatherIcon}"></i></h1>
      {/if}
      <!-- Temperature -->
      <h2 class="card-text">{temp}</h2>
      <!-- Climate -->
      <h6>{climate}</h6>
      {#if showIcons==true}
        <a href="/" on:click={cityName}><i class="{actionIcon}"></i></a>
      {/if}
    </div>
</div>
