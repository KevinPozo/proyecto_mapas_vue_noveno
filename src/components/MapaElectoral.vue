<template>
  <div class="contenedor-mapa-electoral" ref="chartDiv"></div>
</template>

<script setup>
/**
 * @file MapaElectoral.vue
 * @description Componente LÓGICO Y VISUAL del mapa.
 * - Carga los datos GeoJSON.
 * - Maneja AmCharts.
 * - Gestiona el Drill-down (Provincias -> Cantones -> Parroquias).
 * - Emite eventos de cambio de nivel para que el padre actualice títulos/UI.
 */

import { ref, onMounted, onUnmounted, defineExpose, defineEmits } from "vue";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Datos GeoJSON
import provinciasData from "@/assets/1996/mapa/Provincias.json";
import cantonesData from "@/assets/1996/mapa/Cantones.json";
import parroquiasData from "@/assets/1996/mapa/Parroquias.json";

am4core.useTheme(am4themes_animated);



// --- 1. PROPS Y EMITS ---

const props = defineProps({
  configuracion: {
    type: Object,
    default: () => ({
      colorBase: "#ECEFF1",
      colorHover: "#E91E63",
      colorBorde: "#607D8B",
    }),
  },
});

const emit = defineEmits(["region-selected", "level-change", "map-ready"]);

// --- 2. VARIABLES REACTIVAS ---

const chartDiv = ref(null);
const nivelActual = ref("provincias");
const tituloActual = ref("Resultados Nacionales 1996");
const historialNavegacion = ref([]);

// Variables internas de AmCharts
let chart = null;
let polygonSeries = null;

// --- 3. FUNCIONES DE LÓGICA DEL MAPA (Traídas de MapaEcuador) ---

/**
 * Corrige el winding order (AmCharts).
 */
const corregirGeoJSON = (geojsonOriginal) => {
  const geojson = JSON.parse(JSON.stringify(geojsonOriginal));
  if (!geojson.features) return geojson;

  geojson.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;
    if (geometry.type === "Polygon") {
      geometry.coordinates.forEach((ring) => ring.reverse());
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((poly) =>
        poly.forEach((ring) => ring.reverse())
      );
    }
  });
  return geojson;
};

/**
 * tooltip
 */
const bindRegionTooltip = (template) => {
  template.tooltipText = `[bold]{PROVINCIA}[/]
{CANTON}
{PARROQUIA}
[font-size: 12px]Click para detalles[/]`;
};

/**
 * Click en región -> Drill down
 */
const handleRegionClick = (event) => {
  const target = event?.target || event?.mapPolygon || event;
  const data = target?.dataItem?.dataContext || target?.dataContext || event?.dataItem?.dataContext;

  if (!data) return;

  console.log(`Click en: ${data.PROVINCIA || data.CANTON || data.name}`);

  // Emitir selección
  emit("region-selected", data);

  // Lógica Drill Down
  if (nivelActual.value === "provincias") {
    const codProvincia = data.CODPRO || data.properties?.CODPRO;
    const nombre = data.PROVINCIA || data.properties?.PROVINCIA || data.name;
    if (codProvincia) {
      entrarEnProvincia(codProvincia, nombre);
    }
  } else if (nivelActual.value === "cantones") {
    const codCanton = data.CODCAN || data.properties?.CODCAN;
    const nombre = data.CANTON || data.properties?.CANTON || data.name;
    if (codCanton) {
      entrarEnCanton(codCanton, nombre);
    }
  }
};

const entrarEnProvincia = (idProvincia, nombreProvincia) => {
  const features = cantonesData.features.filter(
    (f) => f.properties.CODPRO === idProvincia
  );

  if (features.length > 0) {
    actualizarMapa(features, "cantones", `Provincia de ${nombreProvincia}`);
  }
};

const entrarEnCanton = (idCanton, nombreCanton) => {
  const features = parroquiasData.features.filter(
    (f) => f.properties.CODCAN === idCanton
  );

  if (features.length > 0) {
    actualizarMapa(features, "parroquias", `Cantón ${nombreCanton}`);
  }
};

/**
 * Actualiza el mapa y guarda historial
 */
const actualizarMapa = (nuevosFeatures, nuevoNivel, nuevoTitulo) => {
  // Guardamos estado anterior
  historialNavegacion.value.push({
    nivel: nivelActual.value,
    geodata: chart.geodata,
    titulo: tituloActual.value,
  });

  const nuevoGeoJSON = {
    type: "FeatureCollection",
    features: nuevosFeatures,
  };

  const datosCorregidos = corregirGeoJSON(nuevoGeoJSON);
  chart.geodata = datosCorregidos;

  nivelActual.value = nuevoNivel;
  tituloActual.value = nuevoTitulo;

  // Emitimos cambio de nivel para que el padre sepa qué mostrar (botón atrás, título)
  emit("level-change", {
    nivel: nuevoNivel,
    titulo: nuevoTitulo,
    puedeRegresar: true
  });

  setTimeout(() => {
    chart.goHome();
  }, 100);
};

// --- 4. EXPOSED METHODS (Para que el padre los llame) ---

/**
 * Función para regresar al nivel anterior
 */
const regresarNivel = () => {
  if (historialNavegacion.value.length > 0) {
    const estadoAnterior = historialNavegacion.value.pop();

    chart.geodata = estadoAnterior.geodata;
    nivelActual.value = estadoAnterior.nivel;
    tituloActual.value = estadoAnterior.titulo;

    emit("level-change", {
      nivel: nivelActual.value,
      titulo: estadoAnterior.titulo,
      puedeRegresar: historialNavegacion.value.length > 0
    });

    setTimeout(() => {
      chart.goHome();
    }, 100);
  }
};

// Exponer métodos al padre
defineExpose({
  regresarNivel,
  nivelActual
});

// --- 5. INITIALIZATION ---

const crearMapa = () => {
  if (chart) chart.dispose();

  chart = am4core.create(chartDiv.value, am4maps.MapChart);
  chart.projection = new am4maps.projections.Miller();
  chart.chartContainer.wheelable = false;

  polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
  polygonSeries.useGeodata = true;

  // Carga inicial: Provincias
  const datosIniciales = corregirGeoJSON(provinciasData);
  chart.geodata = datosIniciales;

  // Template
  const polygonTemplate = polygonSeries.mapPolygons.template;
  bindRegionTooltip(polygonTemplate);

  polygonTemplate.fill = am4core.color(props.configuracion.colorBase);
  polygonTemplate.stroke = am4core.color(props.configuracion.colorBorde);
  polygonTemplate.strokeWidth = 1;
  polygonTemplate.nonScalingStroke = false;

  const hs = polygonTemplate.states.create("hover");
  hs.properties.fill = am4core.color(props.configuracion.colorHover);

  polygonTemplate.events.on("hit", handleRegionClick);

  chart.zoomControl = new am4maps.ZoomControl();
  chart.zoomControl.align = "right";
  chart.zoomControl.valign = "bottom";

  emit("map-ready");

  // Emit state initial
  emit("level-change", {
    nivel: "provincias",
    titulo: "Ecuador",
    puedeRegresar: false
  });
};

onMounted(() => {
  crearMapa();
});

onUnmounted(() => {
  if (chart) chart.dispose();
});


</script>

<style scoped>
.contenedor-mapa-electoral {
  width: 100%;
  height: 500px;
  background-color: transparent;
  position: relative;
}

::v-deep .amcharts-export-menu ul {
  background: #ffffff;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::v-deep .amcharts-export-menu li {
  padding: 8px 16px;
  cursor: pointer;
  color: #333;
}

::v-deep .amcharts-export-menu li:hover {
  background: #f5f5f5;
  color: #000;
}
</style>
