<!-- src/views/PaginaResultadosExtranjero.vue -->
<template>
  <div>
    <MapaNacional />
  </div>
</template>

<script>
import MapaNacional from "@/components/MapaNacional.vue";
import MapaExtranjero from "@/components/MapaExtranjero.vue";
export default {
  name: "PaginaResultadosExtranjero",
  components: {
    MapaNacional,
    MapaExtranjero,
  },
};
</script>
