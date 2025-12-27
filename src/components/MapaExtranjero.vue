<!-- src/components/MapaExtranjero.vue -->
<template>
  <v-sheet>
    <v-container fluid class="fondo-general">
      <v-row no-gutters>
        <v-card outlined color="transparent" width="100%">
          <v-row no-gutters>
            <v-col cols="12" md="3"></v-col>
            <v-col cols="12" md="6">
              <div class="flex-column-center">
                <div class="contenedor-titulo">
                  <v-card elevation="24" color="#2c3e50">
                    <div class="tarjeta-titulo-mapa">
                      Resultados Internacionales 1996
                    </div>
                  </v-card>
                </div>
                <div class="contenedor-botones-vuelta">
                  <v-btn :color="esPrimeraVuelta ? '#F88C0F' : 'white'"
                    :class="esPrimeraVuelta ? 'white--text' : 'black--text'" tile @click="setVuelta(1)">
                    PRIMERA VUELTA
                  </v-btn>
                  <v-btn :color="!esPrimeraVuelta ? '#F88C0F' : 'white'"
                    :class="!esPrimeraVuelta ? 'white--text' : 'black--text'" tile @click="setVuelta(2)">
                    SEGUNDA VUELTA
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="9">
              <MapaMundi :datos="datosParaMapa" :configuracion="configuracionMapa" />
            </v-col>
            <v-col cols="12" md="3">
              <v-card class="pa-4 text-center">
                <h3>Tarjetas Pendientes</h3>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script>
import MapaMundi from "./MapaMundi.vue";
import {
  COLORES_PARTIDOS,
  getColorPartido,
} from "@/assets/Informacion/ColoresPartidos.js";

const DATOS_MOCK_1RA = [
  {
    id: "ES",
    name: "España",
    ganador: "Guillermo Lasso",
    id_partido: "1",
    votos: 5000,
  },
  {
    id: "US",
    name: "Estados Unidos",
    ganador: "Isidro Romero",
    id_partido: "2",
    votos: 3000,
  },
  {
    id: "RU",
    name: "RUSIA",
    ganador: "Isidro Romero",
    id_partido: "3",
    votos: 3000,
  },
];
const DATOS_MOCK_2DA = [
  {
    id: "ES",
    name: "España",
    ganador: "Guillermo Lasso",
    id_partido: "1",
    votos: 6000,
  },
  {
    id: "US",
    name: "Estados Unidos",
    ganador: "Guillermo Lasso",
    id_partido: "2",
    votos: 3200,
  },
];

export default {
  name: "MapaExtranjero",

  components: {
    MapaMundi,
  },

  data() {
    return {
      vueltaSeleccionada: 1,
      configuracionMapa: {
        colorDefecto: "#CCC6C6",
        colorBorde: "#000000",
        proyeccion: "Miller",
      },
    };
  },

  computed: {
    esPrimeraVuelta() {
      return this.vueltaSeleccionada === 1;
    },

    datosParaMapa() {
      const datosCrudos = this.esPrimeraVuelta
        ? DATOS_MOCK_1RA
        : DATOS_MOCK_2DA;

      return datosCrudos.map((item) => {
        const colorInfo = getColorPartido(item.id_partido);
        return {
          id: item.id,
          colorHover: colorInfo.principal,
          ganador: item.ganador,
          votos: item.votos,
          tooltipPersonalizado: `Ganador: [bold]${item.ganador}[/]\nVotos: ${item.votos}`,
        };
      });
    },
  },

  methods: {
    setVuelta(numero) {
      this.vueltaSeleccionada = numero;
    },
  },
};
</script>
