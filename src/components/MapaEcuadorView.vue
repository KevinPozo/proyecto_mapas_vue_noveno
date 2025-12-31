<template>
  <v-card-text class="pa-0">
    <v-row no-gutters>
      <v-col cols="12" md="3" class="pa-4 border-right">
        <div class="text-h6 mb-2">Instrucciones</div>
        <p class="body-2 text--secondary">
          1. Haga clic en una <strong>Provincia</strong> para ver sus
          cantones.<br />
          2. Haga clic en un <strong>Cantón</strong> para ver sus parroquias.<br />
          3. Use el botón "Regresar" para subir de nivel.
        </p>

        <v-divider class="my-4"></v-divider>

        <v-alert
          border="left"
          colored-border
          color="#12a2c2"
          elevation="2"
          dense
          v-if="!datosCargados"
        >
          Cargando cartografía...
        </v-alert>

        <v-alert v-else type="success" dense text>
          Cartografía cargada
        </v-alert>
      </v-col>

      <v-col cols="12" md="9">
        <MapaEcuadorDrilldown
          v-if="datosCargados"
          :geoJsonProvincias="jsonProvincias"
          :geoJsonCantones="jsonCantones"
          :geoJsonParroquias="jsonParroquias"
          :configuracion="configMapa"
        />

        <div
          v-else
          class="d-flex justify-center align-center"
          style="height: 600px"
        >
          <v-progress-circular
            indeterminate
            color="#12a2c2"
            size="64"
          ></v-progress-circular>
        </div>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script>
import MapaEcuadorDrilldown from "./MapaEcuador.vue";

// Si son muy pesados, es mejor usar axios en el mounted() en lugar de import estático.
import provinciasData from "@/assets/GeoJson/ProvinciasEcu.json";
import cantonesData from "@/assets/GeoJson/CantonesEcu.json";
import parroquiasData from "@/assets/GeoJson/ParroquiasEcu.json";

export default {
  name: "VistaMapaEcuador",

  components: {
    MapaEcuadorDrilldown,
  },

  data() {
    return {
      datosCargados: false,
      jsonProvincias: null,
      jsonCantones: null,
      jsonParroquias: null,
      configMapa: {
        colorBase: "#ECEFF1",
        colorHover: "#E91E63", // Un color magenta como el de tu imagen de QGIS
        colorBorde: "#607D8B",
      },
    };
  },

  mounted() {
    this.cargarDatos();
  },

  methods: {
    cargarDatos() {
      // Simulamos una pequeña carga o procesamos los datos si es necesario
      this.datosCargados = false;
      setTimeout(() => {
        // Asignamos los datos importados
        this.jsonProvincias = provinciasData;
        this.jsonCantones = cantonesData;
        this.jsonParroquias = parroquiasData;
        this.datosCargados = true;
      }, 500);
    },

    recargarDatos() {
      this.cargarDatos();
    },
  },
};
</script>

<style scoped>
</style>
