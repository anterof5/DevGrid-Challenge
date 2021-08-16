<script>
  export let cityName;
  let icon = 'bi bi-cloud-rain';
  let temp = '22°C';
  let climate='Light rain';
</script>

<div class="card border-secondary text-center mx-2 my-3" style="width: 10rem;">
    <div class="card-body card-shadow ">
      <!-- Card title -->
      <h5 class="card-title text-centered">{cityName}</h5>
      <!-- Bootstrap icons -->
      <h1><i class="{icon}"></i></h1>
      <!-- Temperature -->
      <h1 class="card-text">{temp}</h1>
      <!-- Climate -->
      <h6>{climate}</h6>
    </div>
</div>
