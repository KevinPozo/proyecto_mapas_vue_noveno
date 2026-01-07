<template>
  <div class="pagina-resultados">
    <MapaExtranjero />
    <MapaEcuador />
  </div>
</template>

<script setup>
import MapaEcuador from "@/components/MapaElectoral.vue";
import MapaExtranjero from "@/components/MapaExtranjero.vue";
</script>

<style scoped>
.pagina-resultados {
  width: 100%;
  min-height: 100vh;
}
</style>
