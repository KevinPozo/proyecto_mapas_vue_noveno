<template>
  <v-sheet class="position-relative overflow-hidden">
    <v-navigation-drawer v-model="isDrawerOpen" absolute temporary width="300" color="#12a2c2" dark>
      <v-container class="pa-5">
        <h3 class="mb-4 text-uppercase font-oswald">
          Filtros Ecuador
        </h3>

        <div class="texto-filtro">VUELTA*</div>
        <v-select v-model="filtroVuelta" :items="itemsVuelta" outlined dense background-color="rgba(255,255,255,0.1)"
          hide-details dark class="mb-4"></v-select>

        <div class="texto-filtro">PARTIDO POLITICO*</div>
        <v-select v-model="filtroPartido" :items="itemsPartido" outlined dense background-color="rgba(255,255,255,0.1)"
          hide-details dark class="mb-4"></v-select>

        <div class="texto-filtro">Provincia</div>
        <v-select v-model="filtroProvincia" :items="itemsProvincia" outlined dense
          background-color="rgba(255,255,255,0.1)" hide-details dark class="mb-6"
          placeholder="Ej: Pichincha"></v-select>

        <p class="caption white--text">*Campo Obligatorio</p>

        <div class="texto-filtro">Cantón</div>
        <v-select v-model="filtroCanton" :items="itemsCanton" outlined dense background-color="rgba(255,255,255,0.1)"
          hide-details dark class="mb-6" placeholder="Ej: Quito"></v-select>

        <p class="caption white--text">*Campo Obligatorio</p>

        <div class="texto-filtro">Parroquia</div>
        <v-select v-model="filtroParroquia" :items="itemsParroquia" outlined dense
          background-color="rgba(255,255,255,0.1)" hide-details dark class="mb-6"
          placeholder="Ej: San Bartolo"></v-select>

        <p class="caption white--text">*Campo Obligatorio</p>

        <v-btn block color="white" light class="font-weight-bold font-oswald" @click="aplicarFiltros">
          BUSCAR
        </v-btn>
      </v-container>
    </v-navigation-drawer>

    <v-btn color="#12a2c2" dark fab small absolute top left style="top: 20px; left: 20px; z-index: 5"
      @click="isDrawerOpen = !isDrawerOpen">
      <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
        <path fill="currentColor"
          d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
      </svg>
    </v-btn>

    <v-container fluid class="fondo-general">
      <v-row no-gutters>
        <v-card outlined color="transparent" width="100%">

          <v-row no-gutters>
            <v-col cols="12" md="3"></v-col>
            <v-col cols="12" md="6">
              <div class="d-flex flex-column align-center">
                <div class="my-5">
                  <v-card elevation="24" color="#2c3e50">
                    <div class="tarjeta-titulo-mapa">
                      Resultados Nacionales 1996
                    </div>
                  </v-card>
                </div>

                <div class="contenedor-botones-vuelta">
                  <v-btn tile class="btn-vuelta" :class="esPrimeraVuelta ? 'btn-vuelta-activo' : 'btn-vuelta-inactivo'"
                    @click="setVuelta(1)">
                    PRIMERA VUELTA
                  </v-btn>

                  <v-btn tile class="btn-vuelta" :class="!esPrimeraVuelta ? 'btn-vuelta-activo' : 'btn-vuelta-inactivo'"
                    @click="setVuelta(2)">
                    SEGUNDA VUELTA
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="9">
              <div class="wrapper-mapa">
                <transition name="fade">
                  <div v-if="puedeRegresar" class="boton-regresar" @click="handleGoBack">
                    <span class="icono-atras">←</span>
                    Regresar a {{ nombreNivelSuperior }}
                  </div>
                </transition>

                <div class="titulo-area">{{ tituloActual }}</div>

                <MapaElectoral class="componente-mapa" ref="mapaRef" @region-selected="onRegionSelected"
                  @level-change="onLevelChange" />
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="d-flex justify-center mb-2">
                <v-btn class="boton-limpiar-filtros" depressed small @click="limpiarFiltros">
                  LIMPIAR FILTROS
                </v-btn>
              </div>
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
/**
 * @file MapaEcuador.vue
 * @description VISTA PRINCIPAL (Contenedor).
 * Gestiona el layout general, el menú lateral de filtros (Drawer) 
 * e integra el componente MapaElectoral.
 */

import MapaElectoral from "./MapaElectoral.vue";

export default {
  name: "MapaEcuador",
  components: {
    MapaElectoral,
  },
  data() {
    return {
      // --- STATE UI ---
      /** Controla la visibilidad del drawer de filtros */
      isDrawerOpen: false,
      /** Indica si se visualiza la primera vuelta electoral */
      esPrimeraVuelta: true,

      // --- FILTROS ---
      filtroVuelta: null,
      filtroPartido: null,
      filtroProvincia: null,
      filtroCanton: null,
      filtroParroquia: null,

      // Listas estáticas para selects (podrían venir de API en futuro)
      itemsVuelta: ["Primera Vuelta", "Segunda Vuelta"],
      itemsPartido: [
        "Partido Social Cristiano",
        "Izquierda Democrática",
        "Partido Roldosista Ecuatoriano",
        "Movimiento de Unidad Plurinacional Pachakutik",
      ],
      itemsProvincia: [
        "AZUAY", "BOLIVAR", "CAÑAR", "CARCHI", "CHIMBORAZO", "COTOPAXI",
        "EL ORO", "ESMERALDAS", "GALAPAGOS", "GUAYAS", "IMBABURA", "LOJA",
        "LOS RIOS", "MANABI", "MORONA SANTIAGO", "NAPO", "ORELLANA",
        "PASTAZA", "PICHINCHA", "SANTA ELENA", "SANTO DOMINGO DE LOS TSACHILAS",
        "SUCUMBIOS", "TUNGURAHUA", "ZAMORA CHINCHIPE",
      ],
      itemsCanton: [
        "CUENCA", "GUARANDA", "AZOGUES", "TULCAN", "RIOBAMBA", "LATACUNGA",
        "MACHALA", "ESMERALDAS", "PUERTO BAQUERIZO MORENO", "GUAYAQUIL",
        "IBARRA", "LOJA", "BABAHOYO", "PORTOVIEJO", "MACAS", "TENA",
        "PUERTO FRANCISCO DE ORELLANA", "PUYO", "QUITO", "SANTA ELENA",
        "SANTO DOMINGO", "NUEVA LOJA", "AMBATO", "ZAMORA",
      ],
      itemsParroquia: [
        "BELLAVISTA", "CAÑARIBAMBA", "EL BATÁN", "EL SAGRARIO", "EL VECINO",
        "GIL RAMÍREZ DÁVALOS", "HERMANO MIGUEL", "HUAYNACÁPAC", "MACHÁNGARA",
        "MONAY", "SAN BLAS", "SAN SEBASTIÁN", "SUCRE", "TOTORACOCHA", "YANUNCAY",
      ],

      // --- MAPA STATE ---
      nivelActual: "provincias",
      tituloActual: "Ecuador",
      puedeRegresar: false,
    };
  },
  computed: {
    /**
     * Determina el nombre del nivel superior para el botón "Regresar".
     * @returns {string} Nombre del nivel (Cantón o Ecuador).
     */
    nombreNivelSuperior() {
      return this.nivelActual === "parroquias" ? "Cantón" : "Ecuador";
    },
  },
  methods: {
    /**
     * Establece la vuelta electoral activa.
     * @function setVuelta
     * @param {number} vuelta - 1 o 2.
     */
    setVuelta(vuelta) {
      this.esPrimeraVuelta = vuelta === 1;
    },

    /**
     * Aplica los filtros seleccionados comunicándose con el mapa hijo.
     * @function aplicarFiltros
     */
    aplicarFiltros() {
      if (this.$refs.mapaRef) {
        this.$refs.mapaRef.activarMockData({
          provincia: this.filtroProvincia,
        });
      }
      this.isDrawerOpen = false;
    },

    /**
     * Limpia los filtros y resetea el mapa.
     * @function limpiarFiltros
     */
    limpiarFiltros() {
      this.filtroVuelta = null;
      this.filtroPartido = null;
      this.filtroProvincia = null;
      this.filtroCanton = null;
      this.filtroParroquia = null;

      if (this.$refs.mapaRef) {
        this.$refs.mapaRef.limpiarMapa();
      }
    },

    /**
     * Maneja la selección de una región desde el mapa.
     * @function onRegionSelected
     * @param {Object} data - Datos de la región seleccionada.
     */
    onRegionSelected(data) {
      // Lógica futura para actualizar tarjetas laterales
    },

    /**
     * Sincroniza el estado local cuando el mapa cambia de nivel (drill-down).
     * @function onLevelChange
     * @param {Object} estado - Nuevo estado {nivel, titulo, puedeRegresar}.
     */
    onLevelChange(estado) {
      this.nivelActual = estado.nivel;
      this.tituloActual = estado.titulo;
      this.puedeRegresar = estado.puedeRegresar;
    },

    /**
     * Ejecuta la acción de regresar nivel en el mapa.
     * @function handleGoBack
     */
    handleGoBack() {
      if (this.$refs.mapaRef) {
        this.$refs.mapaRef.regresarNivel();
      }
    },
  },
};
</script>

<style scoped>
/* Clases utilitarias personalizadas */
.font-oswald {
  font-family: 'Oswald', sans-serif;
}

.fondo-general {
  background-color: #f4f7f6;
  min-height: 100vh;
}

.texto-filtro {
  font-weight: bold;
  margin-bottom: 5px;
  color: white;
}

/* Layout Mapa */
.wrapper-mapa {
  width: 100%;
  height: 500px;
  background: transparent;
  position: relative;
}

.componente-mapa {
  width: 100%;
  height: 100%;
}

/* UI Controls Mapa */
.boton-regresar {
  position: absolute;
  top: -38px;
  right: 20px;
  z-index: 10;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font-family: var(--fuente-principal, sans-serif);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.boton-regresar:hover {
  transform: translateY(-2px);
}

.titulo-area {
  position: absolute;
  top: -38px;
  left: 20px;
  z-index: 10;
  font-family: var(--fuente-titulos, sans-serif);
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px 15px;
  border-radius: 4px;
  pointer-events: none;
}

/* Tarjeta Titulo */
.tarjeta-titulo-mapa {
  padding: 10px;
  color: white;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Botones Vuelta */
.contenedor-botones-vuelta {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.btn-vuelta {
  width: 150px;
  font-weight: bold;
  color: white;
}

.btn-vuelta-activo {
  background-color: #e67e22 !important;
}

.btn-vuelta-inactivo {
  background-color: #95a5a6 !important;
}

.boton-limpiar-filtros {
  background-color: #12a2c2;
  color: white;
}

/* Transiciones Vue */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .contenedor-botones-vuelta {
    margin-bottom: 0px;
  }

  .wrapper-mapa {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: auto;
    min-height: 500px;
    padding-top: 10px;
  }

  .titulo-area,
  .boton-regresar {
    position: static;
    /* Elimina override redundante de top/left/transform */
    width: 90%;
    margin-bottom: 15px;
  }

  .titulo-area {
    order: 1;
    text-align: center;
    font-size: 1.1rem;
  }

  .boton-regresar {
    order: 2;
    width: auto;
    font-size: 0.8rem;
    margin-bottom: 20px;
  }

  .componente-mapa {
    order: 3;
    height: 500px;
  }
}
</style>