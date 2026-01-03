<template>
  <div class="contenedor-mapa-electoral" ref="chartDiv"></div>
</template>

<script>
/**
 * @file MapaElectoral.vue
 * @description Componente LÓGICO Y VISUAL del mapa electoral.
 * Encargado de renderizar el mapa con AmCharts, gestionar la navegación drill-down
 * (Provincias -> Cantones -> Parroquias) y visualizar los resultados.
 */

// 1. Librerías Externas
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// 2. Datos y Assets
import { COLORES_PARTIDOS } from "@/assets/Informacion/ColoresPartidos.js";
import provinciasData from "@/assets/1996/mapa/Provincias.json";
import cantonesData from "@/assets/1996/mapa/Cantones.json";
import parroquiasData from "@/assets/1996/mapa/Parroquias.json";

// Configuración global de temas
am4core.useTheme(am4themes_animated);

export default {
  name: "MapaElectoral",
  props: {
    /**
     * Configuración visual del mapa (colores y exportación).
     * @type {Object}
     */
    configuracion: {
      type: Object,
      default: () => ({
        colorBase: "#ECEFF1",
        colorHover: "#E91E63",
        colorBorde: "#607D8B",
        exportar: true,
      }),
    },
  },
  data() {
    return {
      /** Instancia principal del gráfico de AmCharts */
      chart: null,
      /** Serie de polígonos del mapa */
      polygonSeries: null,
      /** Nivel actual de visualización (provincias|cantones|parroquias) */
      nivelActual: "provincias",
      /** Título dinámico del mapa */
      tituloActual: "Resultados Nacionales 1996",
      /** Pila de historial para la navegación hacia atrás */
      historialNavegacion: [],
      /** Bandera para controlar la visualización de datos simulados */
      mostrarMockData: false,
    };
  },
  mounted() {
    this.crearMapa();
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    /**
     * Genera datos aleatorios de votación para simulación visual.
     * @function generarDatosAleatorios
     * @returns {Object} Objeto con ganador, votos, porcentaje y color de relleno.
     */
    generarDatosAleatorios() {
      const keys = Object.keys(COLORES_PARTIDOS);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const partido = COLORES_PARTIDOS[randomKey];

      const votos = Math.floor(Math.random() * 50000) + 1000;
      const total = Math.floor(votos * (1.2 + Math.random()));
      const porcentaje = ((votos / total) * 100).toFixed(1) + "%";

      return {
        ganador: partido.nombre,
        votos: votos.toLocaleString(),
        porcentaje: porcentaje,
        fill: partido.principal,
      };
    },

    /**
     * Corrige el "Winding Order" de la geometría GeoJSON para AmCharts.
     * @function corregirGeometria
     * @param {Object} geojson - Objeto GeoJSON a corregir.
     * @returns {Object} GeoJSON con coordenadas invertidas si es necesario.
     */
    corregirGeometria(geojson) {
      if (!geojson.features) return geojson;
      geojson.features.forEach((feature) => {
        const geometry = feature.geometry;
        if (geometry) {
          if (geometry.type === "Polygon") {
            geometry.coordinates.forEach((ring) => ring.reverse());
          } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((poly) =>
              poly.forEach((ring) => ring.reverse())
            );
          }
        }
      });
      return geojson;
    },

    /**
     * Inyecta o limpia datos simulados en las propiedades del GeoJSON.
     * @function inyectarMockData
     * @param {Object} geojson - Objeto GeoJSON objetivo.
     * @returns {Object} GeoJSON modificado.
     */
    inyectarMockData(geojson) {
      if (!geojson.features) return geojson;

      geojson.features.forEach((feature) => {
        if (this.mostrarMockData) {
          const mockData = this.generarDatosAleatorios();
          feature.properties = { ...feature.properties, ...mockData };
        } else {
          // Limpieza de datos y reseteo a blanco
          feature.properties = {
            ...feature.properties,
            ganador: undefined,
            votos: undefined,
            porcentaje: undefined,
            fill: "#FFFFFF",
          };
        }
      });
      return geojson;
    },

    /**
     * Procesa el GeoJSON completo: clona, corrige geometría e inyecta datos.
     * @function prepararDatosMapa
     * @param {Object} geojsonOriginal - Datos crudos del archivo.
     * @returns {Object} GeoJSON listo para AmCharts.
     */
    prepararDatosMapa(geojsonOriginal) {
      const geojson = JSON.parse(JSON.stringify(geojsonOriginal));
      this.corregirGeometria(geojson);
      this.inyectarMockData(geojson);
      return geojson;
    },

    /**
     * Configura el tooltip dinámico para las regiones.
     * @function bindRegionTooltip
     * @param {Object} template - Template del polígono de AmCharts.
     */
    bindRegionTooltip(template) {
      template.adapter.add("tooltipText", (text, target) => {
        const data = target.dataItem.dataContext;
        // Prioridad: Datos de mock > Datos de feature > Texto base
        if (data && data.ganador) {
          return `[bold]{PROVINCIA}{CANTON}{PARROQUIA}[/]
Ganador: {ganador}
Votos: {votos}
Porcentaje: {porcentaje}
[font-size: 12px]Click para detalles[/]`;
        } else {
          return `[bold]{PROVINCIA}{CANTON}{PARROQUIA}[/]
[font-size: 12px]Click para detalles[/]`;
        }
      });
    },

    /**
     * Maneja el evento click en una región para ejecutar el drill-down.
     * @function handleRegionClick
     * @param {Object} event - Evento de AmCharts.
     */
    handleRegionClick(event) {
      const target = event?.target || event?.mapPolygon || event;
      const data =
        target?.dataItem?.dataContext ||
        target?.dataContext ||
        event?.dataItem?.dataContext;

      if (!data) return;

      this.$emit("region-selected", data);

      if (this.nivelActual === "provincias") {
        const codProvincia = data.CODPRO || data.properties?.CODPRO;
        const nombre =
          data.PROVINCIA || data.properties?.PROVINCIA || data.name;
        if (codProvincia) this.entrarEnProvincia(codProvincia, nombre);
      } else if (this.nivelActual === "cantones") {
        const codCanton = data.CODCAN || data.properties?.CODCAN;
        const nombre = data.CANTON || data.properties?.CANTON || data.name;
        if (codCanton) this.entrarEnCanton(codCanton, nombre);
      }
    },

    /**
     * Navega al nivel de Cantones filtrando por Provincia.
     * @function entrarEnProvincia
     * @param {string} idProvincia - Código de la provincia.
     * @param {string} nombreProvincia - Nombre para el título.
     */
    entrarEnProvincia(idProvincia, nombreProvincia) {
      const features = cantonesData.features.filter(
        (f) => f.properties.CODPRO === idProvincia
      );
      if (features.length > 0) {
        this.actualizarMapa(
          features,
          "cantones",
          `Provincia de ${nombreProvincia}`
        );
      }
    },

    /**
     * Navega al nivel de Parroquias filtrando por Cantón.
     * @function entrarEnCanton
     * @param {string} idCanton - Código del cantón.
     * @param {string} nombreCanton - Nombre para el título.
     */
    entrarEnCanton(idCanton, nombreCanton) {
      const features = parroquiasData.features.filter(
        (f) => f.properties.CODCAN === idCanton
      );
      if (features.length > 0) {
        this.actualizarMapa(features, "parroquias", `Cantón ${nombreCanton}`);
      }
    },

    /**
     * Actualiza los datos del mapa y gestiona el historial de navegación.
     * @function actualizarMapa
     * @param {Array} nuevosFeatures - Lista de features GeoJSON a mostrar.
     * @param {string} nuevoNivel - Identificador del nuevo nivel.
     * @param {string} nuevoTitulo - Título a mostrar en la UI.
     */
    actualizarMapa(nuevosFeatures, nuevoNivel, nuevoTitulo) {
      // Guardar historial
      this.historialNavegacion.push({
        nivel: this.nivelActual,
        geodata: this.chart.geodata,
        titulo: this.tituloActual,
      });

      if (this.chart?.tooltip) this.chart.tooltip.hide();

      const nuevoGeoJSON = {
        type: "FeatureCollection",
        features: nuevosFeatures,
      };

      const datosCorregidos = this.prepararDatosMapa(nuevoGeoJSON);
      this.chart.geodata = datosCorregidos;

      this.nivelActual = nuevoNivel;
      this.tituloActual = nuevoTitulo;

      this.$emit("level-change", {
        nivel: nuevoNivel,
        titulo: nuevoTitulo,
        puedeRegresar: true,
      });

      setTimeout(() => {
        this.chart.goHome();
      }, 100);
    },

    /**
     * Regresa al nivel anterior en el historial de navegación.
     * @function regresarNivel
     */
    regresarNivel() {
      if (this.historialNavegacion.length > 0) {
        const estadoAnterior = this.historialNavegacion.pop();

        this.chart.geodata = estadoAnterior.geodata;
        this.nivelActual = estadoAnterior.nivel;
        this.tituloActual = estadoAnterior.titulo;

        if (this.chart?.tooltip) this.chart.tooltip.hide();

        this.$emit("level-change", {
          nivel: this.nivelActual,
          titulo: estadoAnterior.titulo,
          puedeRegresar: this.historialNavegacion.length > 0,
        });

        setTimeout(() => {
          this.chart.goHome();
        }, 100);
      }
    },

    /**
     * Reinicia el mapa a su estado inicial (Nacional).
     * @function limpiarMapa
     */
    limpiarMapa() {
      this.mostrarMockData = false;
      this.historialNavegacion = [];
      this.nivelActual = "provincias";
      this.tituloActual = "Resultados Nacionales 1996";
      this.crearMapa();
    },

    /**
     * Activa la visualización de datos simulados, con opción de filtro.
     * @function activarMockData
     * @param {Object} filtros - Filtros aplicados (ej. { provincia: 'PICHINCHA' }).
     */
    activarMockData(filtros = {}) {
      this.mostrarMockData = true;

      if (filtros.provincia) {
        const provinciaEncontrada = provinciasData.features.find(
          (p) => p.properties.PROVINCIA === filtros.provincia
        );

        if (provinciaEncontrada) {
          const { CODPRO, PROVINCIA } = provinciaEncontrada.properties;
          this.entrarEnProvincia(CODPRO, PROVINCIA);
          return;
        }
      }

      const dataActual = this.chart.geodata;
      if (dataActual) {
        const datos = JSON.parse(JSON.stringify(dataActual));
        this.inyectarMockData(datos);
        this.chart.geodata = datos;
      }
    },

    /**
     * Inicializa la instancia del mapa AmCharts.
     * @function crearMapa
     */
    crearMapa() {
      if (this.chart) this.chart.dispose();

      let chart = am4core.create(this.$refs.chartDiv, am4maps.MapChart);
      chart.projection = new am4maps.projections.Miller();
      chart.chartContainer.wheelable = false;

      let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
      polygonSeries.useGeodata = true;

      const datosIniciales = this.prepararDatosMapa(provinciasData);
      chart.geodata = datosIniciales;

      let polygonTemplate = polygonSeries.mapPolygons.template;
      this.bindRegionTooltip(polygonTemplate);

      // Bind color
      polygonTemplate.propertyFields.fill = "fill";
      polygonTemplate.fill = am4core.color(this.configuracion.colorBase);
      polygonTemplate.stroke = am4core.color(this.configuracion.colorBorde);
      polygonTemplate.strokeWidth = 1;
      polygonTemplate.nonScalingStroke = false;

      let hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color(this.configuracion.colorHover);

      polygonTemplate.events.on("hit", this.handleRegionClick);

      // Controles
      chart.zoomControl = new am4maps.ZoomControl();
      chart.zoomControl.align = "right";
      chart.zoomControl.valign = "bottom";

      let homeButton = new am4core.Button();
      homeButton.events.on("hit", () => chart.goHome());
      homeButton.icon = new am4core.Sprite();
      homeButton.padding(7, 5, 7, 5);
      homeButton.width = 30;
      homeButton.icon.path =
        "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z";
      homeButton.marginBottom = 10;
      homeButton.parent = chart.zoomControl;
      homeButton.insertBefore(chart.zoomControl.plusButton);
      homeButton.exportable = false; // Ocultar en exportación

      // Exportación
      if (this.configuracion.exportar !== false) {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.align = "right";
        chart.exporting.menu.verticalAlign = "top";
        chart.exporting.menu.items = [{
          label: "",
          icon: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23546E7A' width='24px' height='24px'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/%3E%3C/svg%3E",
          menu: [
            {
              label: "Imagen",
              menu: [
                { type: "png", label: "PNG" },
                { type: "jpg", label: "JPG" },
                { type: "svg", label: "SVG" },
                { type: "pdf", label: "PDF" }
              ]
            },
            {
              label: "Datos",
              menu: [
                { type: "json", label: "JSON" },
                { type: "csv", label: "CSV" },
                { type: "xlsx", label: "XLSX" },
                { type: "html", label: "HTML" }
              ]
            },
            {
              label: "Imprimir",
              type: "print"
            }
          ]
        }];
        chart.exporting.filePrefix = "mapa_electoral_ecuador";
      }

      this.chart = chart;
      this.$emit("map-ready");
      this.$emit("level-change", {
        nivel: "provincias",
        titulo: "Ecuador",
        puedeRegresar: false,
      });
    },
  },
};
</script>

<style scoped>
.contenedor-mapa-electoral {
  width: 100%;
  height: 500px;
  background-color: transparent;
  position: relative;
}

/* Uso de :deep() para Vue 3 en lugar de ::v-deep */
:deep(.amcharts-amexport-item:hover) {
  background: #f5f5f5;
  color: #000;
}

:deep(.amcharts-amexport-label) {
  display: block;
  text-decoration: none;
  color: inherit;
}
</style>