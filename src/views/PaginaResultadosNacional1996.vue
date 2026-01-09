<template>
  <div class="main-container">
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- CARRUSEL DE PÁGINA COMPLETA -->
    <v-window v-model="vistaActual" class="h-100" touchless>
        
        <!-- VISTA 0: MAPA (Con Tarjeta integrada) -->
        <v-window-item :value="0" class="h-100">
             <MapaNacional
              v-if="!loading"
              :geoProvincias="geoProvincias"
              :geoCantones="geoCantones"
              :geoParroquias="geoParroquias"
              :resultadosProvincias="resultadosProvincias"
              :resultadosCantones="resultadosCantones"
              :resultadosParroquias="resultadosParroquias"
              :colores="colores"
              @filter-change="actualizarFiltros"
            />
        </v-window-item>

        <!-- VISTA 1: GRÁFICO -->
        <v-window-item :value="1" class="h-100">
            <div class="d-flex justify-center align-center h-100" 
                 style="background-image: url('assets/img/Fondos/fondo2.jpg'); background-size: cover; background-position: center;">
                <!-- Contenedor limitado para la gráfica con fondo blanco semitransparente -->
                 <div class="bg-white rounded shadow p-4 d-flex flex-column" 
                      style="width: 90%; height: 80vh; opacity: 0.95;">
                    <GraficoBarras 
                        v-if="vistaActual === 1"
                        :datos="datosCalculados" 
                        categoria="presidentes"
                    />
                </div>
            </div>
        </v-window-item>

        <!-- VISTA 2: TABLA -->
        <v-window-item :value="2" class="h-100">
             <div class="d-flex justify-center align-start h-100 pt-10" 
                  style="background-image: url('assets/img/Fondos/fondo2.jpg'); background-size: cover; background-position: center; overflow-y: auto;">
                
                <div class="bg-white rounded shadow p-4" 
                     style="width: 95%; opacity: 0.95;">
                    <TablaGenerica 
                        v-if="vistaActual === 2"
                        :datos="datosCalculados" 
                        :titulo="tituloTabla"
                        :filtros="filtrosActuales"
                    />
                </div>
             </div>
        </v-window-item>

    </v-window>

    <!-- NAVEGACIÓN FLOTANTE BOTTOM -->
    <div class="navegacion-flotante">
        <v-btn icon large class="mx-2" @click="vistaActual = 0">
            <v-icon :color="vistaActual === 0 ? '#12a2c2' : 'grey'">mdi-map</v-icon>
        </v-btn>
        <v-btn icon large class="mx-2" @click="vistaActual = 1">
            <v-icon :color="vistaActual === 1 ? '#12a2c2' : 'grey'">mdi-chart-bar</v-icon>
        </v-btn>
        <v-btn icon large class="mx-2" @click="vistaActual = 2">
            <v-icon :color="vistaActual === 2 ? '#12a2c2' : 'grey'">mdi-table</v-icon>
        </v-btn>
    </div>

  </div>
</template>

<script>
import MapaNacional from "@/components/MapaNacional";
import GraficoBarras from "@/components/GraficoBarras.vue";
import TablaGenerica from "@/components/TablaGenerica.vue";

// Importar datos geográficos directamente
import geoProvincias from "@/assets/1996/MapaNacional/provincias.json";
import resultadosProvincias from "@/assets/1996/datos/presidentes/PrimeraVuelta/Datos2025Provincias.json";
import resultadosCantones from "@/assets/1996/datos/presidentes/PrimeraVuelta/Datos2025Cantones.json";
import resultadosParroquias from "@/assets/1996/datos/presidentes/PrimeraVuelta/Datos2025Parroquias.json";

import { COLORES_PARTIDOS } from "@/assets/Informacion/ColoresPartidos";

export default {
  name: "PaginaResultadosNacional1996",
  components: {
    MapaNacional,
    GraficoBarras,
    TablaGenerica
  },
  data() {
    return {
      vistaActual: 0,
      loading: false,
      
      // GeoJSONs
      geoProvincias,
      geoCantones: {},
      geoParroquias: {},

      // Resultados
      resultadosProvincias,
      resultadosCantones,
      resultadosParroquias,

      // Colores (Filtrar solo los partidos con siglas, excluir los numéricos antiguos)
      colores: Object.keys(COLORES_PARTIDOS)
        .filter(key => isNaN(key))
        .reduce((obj, key) => {
          obj[key] = COLORES_PARTIDOS[key];
          return obj;
        }, {}),

      // Estado de Filtros
      filtrosActuales: {
          provincia: '',
          canton: '',
          partido: ''
      }
    };
  },
  created() {
      // Cargar geojson opcionales dinámicamente si existen
      try {
          const mapContext = require.context("@/assets/1996/MapaNacional/", false, /\.json$/);
          if (mapContext.keys().includes("./cantones.json")) {
              this.geoCantones = mapContext("./cantones.json");
          }
          if (mapContext.keys().includes("./parroquias.json")) {
              this.geoParroquias = mapContext("./parroquias.json");
          }
      } catch (e) {
          console.warn("Could not load optional map files dynamically:", e);
      }
  },
  computed: {
    tituloTabla() {
          if (this.filtrosActuales.canton) return `RESULTADOS - ${this.filtrosActuales.canton}`;
          if (this.filtrosActuales.provincia) return `RESULTADOS - ${this.filtrosActuales.provincia}`;
          return "RESULTADOS NACIONALES";
    },

    // Lógica para transformar y filtrar datos para la Tabla y Gráfica
    datosCalculados() {
        const { provincia, canton, partido } = this.filtrosActuales;

        let fuente = [];
        let nivel = 'nacional'; // muestra provincias
        let filtroId = null;
        let filtroKey = null;

        // 1. Determinar Nivel y Fuente de Datos (Lógica Drill-down)
        // Si hay cantón -> Mostramos Parroquias del cantón
        if (canton && provincia) {
            nivel = 'canton';
            fuente = this.resultadosParroquias || []; // Debería tener datos de parroquias
            
            // Buscar ID del Cantón para filtrar parroquias
            // Primero hallamos CODPRO de la provincia
            const provFeature = this.geoProvincias.features.find(f => f.properties.PROVINCIA === provincia);
            if (provFeature) {
                const idProv = String(provFeature.properties.CODPRO).replace(/^0+/, "");
                
                // Ahora hallamos CODCAN del cantón en ese CODPRO
                if (this.geoCantones && this.geoCantones.features) {
                     const cantFeature = this.geoCantones.features.find(f => 
                        String(f.properties.CODPRO).replace(/^0+/, "") === idProv &&
                        (f.properties.CANTON === canton || f.properties.NOM_CAN === canton)
                     );
                     if (cantFeature) {
                         filtroId = String(cantFeature.properties.CODCAN); // Los JSON de datos suelen tener ceros a la izq?
                         // Ajuste: Los datos JSON usan CODCAN tal cual viene (ej "260")
                         // Verificamos si en el JSON de cantones/parroquias quitan ceros o no.
                         // En el view anterior vimos "CODCAN": "260".
                         filtroId = String(cantFeature.properties.CODCAN);
                         filtroKey = "CODCAN"; 
                     }
                }
            } else {
                 // Fallback si no hay geojson cargado aun, intentar coincidir nombres? (Peligroso por homónimos)
            }

        } 
        // Si hay provincia -> Mostramos Cantones de la provincia
        else if (provincia) {
            nivel = 'provincia';
            fuente = this.resultadosCantones || [];
            
            const provFeature = this.geoProvincias.features.find(f => f.properties.PROVINCIA === provincia);
            if (provFeature) {
                // En JSON Datos, CODPRO es "01", "02". En GeoJSON properties.CODPRO puede ser "01".
                filtroId = String(provFeature.properties.CODPRO);
                filtroKey = "CODPRO";
            }
        } 
        // Si no hay nada -> Mostramos Provincias
        else {
            nivel = 'nacional';
            fuente = this.resultadosProvincias || [];
        }

        // 2. Filtrar
        let datosFiltrados = fuente;
        if (filtroKey && filtroId) {
            // Nota: En los JSON de datos, CODPRO es "01" (string). 
            // filtroId viene del GeoJSON. Asegurar coincidencia de formato (ceros a la izquierda).
            // Funcion helper simple para normalizar si hace falta.
            datosFiltrados = fuente.filter(item => {
                // Comparamos parseInt para evitar líos de ceros a la izquierda "01" vs "1"
                return parseInt(item[filtroKey]) === parseInt(filtroId);
            });
        }

        // 3. Mapear a Formato Plano para la Tabla
        // La tabla espera: { nombre, candidato, partido, votos, porcentaje }
        return datosFiltrados.map(item => {
            // Determinar qué partido mostrar: El seleccionado o el ganador
            const partidoMostrar = partido || item.ganador;
            const infoPartido = item.resultados && item.resultados[partidoMostrar];
            
            // Si no hay info del partido (casos raros), fallback
            if (!infoPartido) return null;

            // Determinar nombre de la jurisdicción (Provincia, Canton, Parroquia)
            let nombreJurisdiccion = item.PROVINCIA || item.CANTON || item.PARROQUIA || "Desconocido";

            return {
                id: item.CODPRO || item.CODCAN || item.CODPAR, // Identificador único para el v-for
                nombre: nombreJurisdiccion,
                candidato: infoPartido.candidato,
                partido: partidoMostrar,
                votos: infoPartido.votos ? infoPartido.votos.toLocaleString() : 0,
                porcentaje: infoPartido.porcentaje
            };
        }).filter(item => item !== null); // Limpiar nulos
    },
  },
  methods: {
    actualizarFiltros(nuevosFiltros) {
        this.filtrosActuales = { ...this.filtrosActuales, ...nuevosFiltros };
    }
  }
};
</script>

<style scoped>
.main-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background-color: #f5f5f5; /* Fondo neutral */
}

/* Estilo para que el v-window ocupe todo */
.h-100 {
    height: 100% !important;
}

/* Navegación flotante estilo Dock */
.navegacion-flotante {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 10px 20px;
    border-radius: 30px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>