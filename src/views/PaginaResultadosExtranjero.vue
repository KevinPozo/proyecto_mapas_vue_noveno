<!-- src/views/PaginaResultadosExtranjero.vue -->
<template>
  <div>
    <!-- Aquí incrustamos nuestro Controlador de Mapa -->
    <MapaExtranjero />

    <!-- Pie de página, etc. -->
  </div>
</template>

<script>
// Importamos el Controlador
import MapaExtranjero from "@/components/MapaExtranjero.vue";

export default {
  name: "PaginaResultadosExtranjero",
  components: {
    MapaExtranjero,
  },
};
</script>
