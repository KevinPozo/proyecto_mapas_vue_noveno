<template>
  <div class="d-flex flex-column h-100 pb-2 position-relative" style="background-color: rgba(255, 255, 255, 0.8); border-radius: 8px;">
    
    <!-- CONTENIDO: Usamos v-window o simplemente v-show para transiciones simples -->
    <div class="flex-grow-1 overflow-hidden d-flex flex-column">
        
        <!-- VISTA 1: TARJETA -->
        <div v-show="vistaActual === 'tarjeta'" class="flex-grow-1 overflow-auto" style="height: 100%;">
            <TarjetaCandidato 
                :itemsCandidato="listaCandidatos" 
                :itemsLeyenda="listaLeyenda"
                :etiquetaTarjeta2="partido"
                @cambio-partido="$emit('cambio-partido', $event)" 
            />
        </div>

        <!-- VISTA 2: GRÁFICA -->
        <div v-show="vistaActual === 'grafica'" class="flex-grow-1 d-flex flex-column justify-center align-center pa-2">
             <div class="w-100 h-100 bg-white rounded elevation-1 d-flex justify-center align-center" style="min-height: 400px; overflow: hidden;">
                <GraficoBarras 
                    v-if="datos && datos.length > 0"
                    :datos="datos" 
                    categoria="presidentes"
                />
                <div v-else class="text-center grey--text">
                    Sin datos para mostrar
                </div>
             </div>
        </div>

        <!-- VISTA 3: TABLA -->
        <div v-show="vistaActual === 'tabla'" class="flex-grow-1 overflow-auto pa-2">
            <TablaGenerica 
                :datos="datos" 
                :titulo="tituloTabla"
                :filtros="filtros"
            />
        </div>

    </div>

    <!-- NAVEGACIÓN (PUNTITOS) -->
    <div class="d-flex justify-content-center pt-2 gap-3" style="border-top: 1px solid #eee;">
        <v-btn icon x-small :ripple="false" plain @click="vistaActual = 'tarjeta'">
            <v-icon :color="vistaActual === 'tarjeta' ? '#12a2c2' : 'grey lighten-1'">
                {{ vistaActual === 'tarjeta' ? 'mdi-circle' : 'mdi-circle-outline' }}
            </v-icon>
        </v-btn>
        
        <v-btn icon x-small :ripple="false" plain @click="vistaActual = 'grafica'">
            <v-icon :color="vistaActual === 'grafica' ? '#12a2c2' : 'grey lighten-1'">
                {{ vistaActual === 'grafica' ? 'mdi-circle' : 'mdi-circle-outline' }}
            </v-icon>
        </v-btn>

        <v-btn icon x-small :ripple="false" plain @click="vistaActual = 'tabla'">
            <v-icon :color="vistaActual === 'tabla' ? '#12a2c2' : 'grey lighten-1'">
                {{ vistaActual === 'tabla' ? 'mdi-circle' : 'mdi-circle-outline' }}
            </v-icon>
        </v-btn>
    </div>

  </div>
</template>

<script>
import TarjetaCandidato from "@/components/TarjetaCandidato.vue";
import GraficoBarras from "@/components/GraficoBarras.vue";
import TablaGenerica from "@/components/TablaGenerica.vue";
import { candidatoData, dessertsData } from "@/assets/data/CandidatosData.js";

export default {
  name: "CarruselInformativo",
  components: {
    TarjetaCandidato,
    GraficoBarras,
    TablaGenerica
  },
  props: {
    // Datos filtrados que vienen del padre (PaginaResultados)
    datos: {
        type: Array,
        default: () => []
    },
    // Filtros actuales para pasar a la tabla o mostrar en títulos
    filtros: {
        type: Object,
        default: () => ({ provincia: '', canton: '', partido: '' })
    },
    // Partido seleccionado para la tarjeta
    partido: {
        type: String,
        default: ''
    }
  },
  data() {
    return {
      vistaActual: 'tarjeta', // tarjeta | grafica | tabla
      listaCandidatos: candidatoData,
      listaLeyenda: dessertsData
    };
  },
  computed: {
      tituloTabla() {
          if (this.filtros.canton) return `RESULTADOS - ${this.filtros.canton}`;
          if (this.filtros.provincia) return `RESULTADOS - ${this.filtros.provincia}`;
          return "RESULTADOS NACIONALES";
      }
  }
};
</script>

<style scoped>
/* Ajustes para asegurar que ocupe el alto disponible */
.gap-3 {
    gap: 12px;
}
</style>
