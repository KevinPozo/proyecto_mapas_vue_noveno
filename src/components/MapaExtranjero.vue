<!-- src/components/MapaExtranjero.vue -->
<template>
  <v-sheet>
    <v-container fluid class="fondo-general">
      <v-row no-gutters>
        <v-card outlined color="transparent" width="100%">
          <!-- Encabezado y Controles -->
          <v-row no-gutters>
            <v-col cols="12" md="3"></v-col>
            <v-col cols="12" md="6">
              <div class="flex-column-center">
                <!-- Título -->
                <div class="contenedor-titulo">
                  <v-card elevation="25" color="#2c3e50">
                    <div class="tarjeta-titulo-mapa">
                      Resultados Internacionales 2021
                    </div>
                  </v-card>
                </div>

                <!-- Botones de Vuelta -->
                <div class="contenedor-botones-vuelta">
                  <v-btn
                    :color="esPrimeraVuelta ? '#F88C0F' : 'white'"
                    :class="esPrimeraVuelta ? 'white--text' : 'black--text'"
                    tile
                    @click="setVuelta(1)"
                  >
                    PRIMERA VUELTA
                  </v-btn>

                  <v-btn
                    :color="!esPrimeraVuelta ? '#F88C0F' : 'white'"
                    :class="!esPrimeraVuelta ? 'white--text' : 'black--text'"
                    tile
                    @click="setVuelta(2)"
                  >
                    SEGUNDA VUELTA
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Área del Mapa -->
          <v-row>
            <v-col cols="12" md="9">
              <MapaMundi
                :datos="datosParaMapa"
                :configuracion="configuracionMapa"
              />
            </v-col>

            <!-- Columna Lateral -->
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

// 1. IMPORTAR TUS COLORES
// Asegúrate de que la ruta sea correcta según donde guardaste el archivo
import {
  COLORES_PARTIDOS,
  getColorPartido,
} from "@/assets/Informacion/ColoresPartidos.js";

// DATOS DE PRUEBA (Simulamos que vienen con un ID de partido)
const DATOS_MOCK_1RA = [
  // España: Ganó el partido "1" (CREO - Azul)
  {
    id: "ES",
    name: "España",
    ganador: "Guillermo Lasso",
    id_partido: "16",
    votos: 5000,
  },
  // EEUU: Ganó el partido "6" (Avanza - Rojo/Rosa)
  {
    id: "US",
    name: "Estados Unidos",
    ganador: "Isidro Romero",
    id_partido: "15",
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
    id_partido: "1",
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
      filtroPartido: "",

      configuracionMapa: {
        colorDefecto: "#D9D9D9",
        colorBorde: "#FFFFFF",
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
        // 2. USAR LA LÓGICA DE COLORES AQUÍ
        // Buscamos el color según el ID del partido que ganó en ese país
        // Si no existe, getColorPartido devuelve uno gris por defecto.
        const colorInfo = getColorPartido(item.id_partido);

        return {
          id: item.id,
          fill: colorInfo.principal, // <--- ¡AQUÍ ESTÁ LA MAGIA! Usamos el color del archivo JS

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
