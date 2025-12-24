<template>
  <div class="contenedor-mapa-mundi" ref="chartdiv"></div>
</template>

<script>
// Importaciones de amCharts 4
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Habilitar temas animados
am4core.useTheme(am4themes_animated);

export default {
  name: "MapaMundi",

  props: {
    // Los datos que pintarán el mapa
    // Estructura esperada: [{ id: "US", value: 10, fill: "#FF0000", ... }]
    datos: {
      type: Array,
      default: () => [],
    },
    // Configuración opcional
    configuracion: {
      type: Object,
      default: () => ({
        colorDefecto: "#D9D9D9", // Gris claro para países sin datos
        colorBorde: "#FFFFFF",
        proyeccion: "Miller", // Miller, Mercator, etc.
      }),
    },
  },

  data() {
    return {
      chart: null,
      polygonSeries: null,
    };
  },

  mounted() {
    this.crearMapa();
  },

  beforeDestroy() {
    // Limpieza de memoria al destruir el componente
    if (this.chart) {
      this.chart.dispose();
    }
  },

  watch: {
    // Si cambian los datos (ej. cambio de vuelta), actualizamos solo la data
    datos: {
      handler(nuevosDatos) {
        if (this.polygonSeries) {
          console.log("MapaMundi: Actualizando datos...", nuevosDatos);
          this.polygonSeries.data = nuevosDatos;
        }
      },
      deep: true,
    },
  },

  methods: {
    crearMapa() {
      // 1. Crear instancia del mapa
      let chart = am4core.create(this.$refs.chartdiv, am4maps.MapChart);

      // 2. Definir geodata (Mapa del Mundo Low Poly)
      chart.geodata = am4geodata_worldLow;

      // 3. Proyección
      if (this.configuracion.proyeccion === "Miller") {
        chart.projection = new am4maps.projections.Miller();
      } else {
        chart.projection = new am4maps.projections.Mercator();
      }

      // 4. Serie de Polígonos (Países)
      let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
      polygonSeries.useGeodata = true;
      polygonSeries.exclude = ["AQ"]; // Excluir Antártida si se desea

      // 5. Configuración de Plantilla de Polígonos
      let polygonTemplate = polygonSeries.mapPolygons.template;

      // Tooltip genérico: Muestra lo que venga en la propiedad 'tooltip' o el nombre por defecto
      // Usaremos "{tooltipPersonalizado}" que vendrá en tus datos procesados
      polygonTemplate.tooltipText = "{name}\n{tooltipPersonalizado}";

      polygonTemplate.fill = am4core.color(this.configuracion.colorDefecto);
      polygonTemplate.stroke = am4core.color(this.configuracion.colorBorde);
      polygonTemplate.strokeWidth = 0.5;

      // Estado Hover (al pasar el mouse)
      let hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color("#F88C0F"); // Naranja institucional por defecto al hacer hover

      // Vinculación de colores desde los datos
      // Si el objeto de datos trae un campo "fill", úsalo para colorear el país
      polygonTemplate.propertyFields.fill = "fill";

      // 6. Asignar datos iniciales
      polygonSeries.data = this.datos;

      // 7. Controles (Zoom)
      chart.zoomControl = new am4maps.ZoomControl();

      // Guardar referencias
      this.chart = chart;
      this.polygonSeries = polygonSeries;
    },
  },
};
</script>

<style scoped>
.contenedor-mapa-mundi {
  width: 100%;
  height: 500px; 
  background-color: transparent;
}
</style>
