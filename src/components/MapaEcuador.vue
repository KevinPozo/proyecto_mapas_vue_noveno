<template>
    <div class="mapa" ref="mapa">
    </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";


import provinciasGeoData from '@/assets/1996/MapaNacional/provincias.json';
import cantonesGeoData from '@/assets/1996/MapaNacional/cantones.json';
import parroquiasGeoData from '@/assets/1996/MapaNacional/parroquias.json';
import { getColorPartido, COLORES_PARTIDOS } from '@/assets/Informacion/ColoresPartidos';

am4core.useTheme(am4themes_animated);

export default {
    name: 'MapaEcuador',

    props: {
        id_1: {
            type: Array,
            default: () => ["", "", 0, 0]
        },
        nvuelta: String,
        datos: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            chart: null,
        }
    },
    mounted() {
        this.createMap();
    },

    watch: {
        id_1: {
            handler() {
                this.createMap();
            },
            deep: true
        },
        datos: {
            handler() {
                this.createMap();
            },
            deep: true
        }
    },

    unmounted() {
        if (this.chart) {
            this.chart.dispose();
        }
    },

    methods: {
        fixGeoJsonIds(geoData) {
            if (geoData && geoData.features) {
                geoData.features.forEach(f => {
                    if (f.properties) {
                        const candidateId = f.properties.id || f.properties.CODPRO || f.properties.CODCAN;
                        if (candidateId && !f.id) {
                            f.id = candidateId;
                        }
                    }
                });
            }
        },
        processData(datos) {
            console.log("Processing Data:", datos);
            if (!datos) return [];
            return datos.map(item => {
                const colorInfo = getColorPartido(item.partido_id);
                const partidoInfo = COLORES_PARTIDOS[item.partido_id];
                console.log(`Item ${item.id} -> Color: ${colorInfo.principal}`);
                return {
                    ...item,
                    fill: colorInfo.principal,
                    winnerName: partidoInfo ? partidoInfo.nombre : 'Desconocido'
                };
            });
        },
        createMap() {
            if (this.chart) {
                this.chart.dispose();
                this.chart = null;
            }

            console.log("--- CREATE MAP STARTED ---");

            this.fixGeoJsonIds(provinciasGeoData);
            this.fixGeoJsonIds(cantonesGeoData);
            this.fixGeoJsonIds(parroquiasGeoData);

            console.log("Fixed Provincias ID (First):", provinciasGeoData.features[0].id);
            console.log("Fixed Provincias Properties (First):", provinciasGeoData.features[0].properties);

            am4core.useTheme(am4themes_animated);

            let chart = am4core.create(this.$refs.mapa, am4maps.MapChart);
            this.chart = chart;

            chart.projection = new am4maps.projections.Miller();
            chart.zoomControl = new am4maps.ZoomControl();

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
            chart.exporting.filePrefix = "mapa_ecuador_export";

            let pais = chart.series.push(new am4maps.MapPolygonSeries());
            pais.geodata = provinciasGeoData;
            pais.useGeodata = true;
            pais.reverseGeodata = true;
            pais.data = this.processData(this.datos);
            this.paisSeries = pais;

            let safeId = this.id_1 || [];
            let cv = safeId[0] === "" || !safeId[0] ? "1raVuelta" : safeId[0];
            let cd = safeId[1] === "" || !safeId[1] ? "General" : safeId[1];
            let cm = safeId[2] === "" || !safeId[2] ? 0 : safeId[2];
            let cm2 = safeId[3] === "" || !safeId[3] ? 0 : safeId[3];

            console.log(`Vuelta: ${cv}, Candidato: ${cd}, Prov: ${cm}, Canton: ${cm2}`);

            let min = "#bdd7e7";
            let max = "#08519c";

            const colorMap = {
                "1": { min: "#bdd7e7", max: "#08519c" },
                "2": { min: "#fdbe85", max: "#a63603" },
                "3": { min: "#cbaada", max: "#7D3C98" },
                "4": { min: "#fcdabc", max: "#e69237" },
                "5": { min: "#B1E1E7", max: "#35A0AC" },
                "6": { min: "#f8bbd0", max: "#e91e63" },
                "7": { min: "#F5B7B1", max: "#E74C3C" },
                "8": { min: "#bdbdbd", max: "#4a4a4a" },
                "9": { min: "#A4DFBF", max: "#229954" },
                "10": { min: "#c7b69f", max: "#553d2a" },
                "11": { min: "#f9e79f", max: "#D4AC0D" },
                "12": { min: "#b4e4f9", max: "#1097D1" },
                "13": { min: "#ffc9c2", max: "#e37469" },
                "14": { min: "#fcf099", max: "#8f6e0f" },
                "15": { min: "#cbe5f6", max: "#3498db" },
                "16": { min: "#DFA4CB", max: "#b5408c" },
            };

            if (colorMap[cd]) {
                min = colorMap[cd].min;
                max = colorMap[cd].max;
            }

            let provincia = chart.series.push(new am4maps.MapPolygonSeries());
            provincia.useGeodata = true;
            provincia.reverseGeodata = true;
            provincia.hidden = true;
            provincia.data = this.processData(this.datos);
            this.provinciaSeries = provincia;

            provincia.geodataSource.events.on("done", () => {
                pais.hide();
                provincia.show();
            });

            let canton = chart.series.push(new am4maps.MapPolygonSeries());
            canton.useGeodata = true;
            canton.reverseGeodata = true;
            canton.hidden = true;
            canton.data = this.processData(this.datos);
            this.cantonSeries = canton;

            canton.geodataSource.events.on("done", () => {
                provincia.hide();
                canton.show();
            });


            let paisPolygon = pais.mapPolygons.template;
            paisPolygon.fill = am4core.color("#D9D9D9");
            paisPolygon.stroke = am4core.color("#000000");
            paisPolygon.strokeWidth = 0.5;
            paisPolygon.nonScalingStroke = true;
            paisPolygon.propertyFields.fill = "fill";
            paisPolygon.tooltipText = "[bold]{PROVINCIA}[/]\nGanador: {winnerName}\nVotos: {votos}\nPorcentaje: {porcentaje}%";

            let hs = paisPolygon.states.create("hover");
            hs.properties.stroke = am4core.color("#000000");
            hs.properties.strokeWidth = 1;

            let provinciaPolygon = provincia.mapPolygons.template;
            provinciaPolygon.fill = am4core.color("#D9D9D9");
            provinciaPolygon.stroke = am4core.color("#000000");
            provinciaPolygon.strokeWidth = 0.5;
            provinciaPolygon.propertyFields.fill = "fill";
            provinciaPolygon.tooltipText = "[bold]{CANTON}[/]\nGanador: {winnerName}\nVotos: {votos}\nPorcentaje: {porcentaje}%"; // Dynamic tooltip

            let hs2 = provinciaPolygon.states.create("hover");
            hs2.properties.stroke = am4core.color("#000000");
            hs2.properties.strokeWidth = 1;

            let cantonPolygon = canton.mapPolygons.template;
            cantonPolygon.fill = am4core.color("#D9D9D9");
            cantonPolygon.stroke = am4core.color("#000000");
            cantonPolygon.strokeWidth = 0.5;
            cantonPolygon.propertyFields.fill = "fill";
            cantonPolygon.tooltipText = "[bold]{PARROQUIA}[/]\nGanador: {winnerName}\nVotos: {votos}\nPorcentaje: {porcentaje}%"; // Dynamic tooltip

            let hs3 = cantonPolygon.states.create("hover");
            hs3.properties.stroke = am4core.color("#000000");
            hs3.properties.strokeWidth = 1;


            let prov = 0;

            let back = new am4core.Button();
            back.events.on("hit", () => {
                chart.goHome();
                goHome();
                pais.show();
                provincia.hide();
                canton.hide();
            });
            back.icon = new am4core.Sprite();
            back.padding(7, 5, 7, 5);
            back.width = 30;
            back.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
            back.marginBottom = 8;
            back.parent = chart.zoomControl;
            back.insertBefore(chart.zoomControl.plusButton);

            const goHome = () => {
                cm = 0;
                cm2 = 0;
            }
            paisPolygon.events.on("hit", (ev) => {
                ev.target.series.chart.zoomToMapObject(ev.target);

                try {
                    let id = ev.target.dataItem.dataContext.id || ev.target.dataItem.dataContext.CODPRO;
                    prov = id;
                    console.log("--- DEBUG PROVINCE CLICK ---");
                    console.log("Clicked Province ID:", id);

                    if (!cantonesGeoData || !cantonesGeoData.features) {
                        console.error("Critical: Cantones GeoData is missing or malformed");
                        return;
                    }

                    let features = [];
                    if (Array.isArray(cantonesGeoData.features)) {
                        features = cantonesGeoData.features;
                    } else if (cantonesGeoData.features.features) {
                        features = cantonesGeoData.features.features;
                    } else {
                        features = [];
                    }

                    let provinceCantones = features.filter(f => {
                        if (!f.properties) return false;
                        return f.properties.CODPRO == id ||
                            String(f.properties.CODPRO) === String(id) ||
                            String(f.properties.CODPRO).replace(/^0+/, '') === String(id).replace(/^0+/, '');
                    });

                    console.log("Filtered Cantones Count:", provinceCantones.length);

                    if (provinceCantones.length === 0) {
                        console.warn("No cantons found for province ID:", id);
                        return;
                    }

                    let cantonData = {
                        type: "FeatureCollection",
                        crs: cantonesGeoData.crs,
                        features: provinceCantones
                    };

                    provincia.geodata = cantonData;

                    pais.hide();
                    provincia.show();
                    provincia.invalidateData();

                } catch (error) {
                    console.error("Error in drill-down (Pais -> Provincia):", error);
                }
            });

            provinciaPolygon.events.on("hit", (ev) => {
                ev.target.series.chart.zoomToMapObject(ev.target);

                try {
                    let idCanton = ev.target.dataItem.dataContext.id || ev.target.dataItem.dataContext.CODCAN;
                    console.log("Clicked Canton ID:", idCanton);

                    if (!parroquiasGeoData || !parroquiasGeoData.features) {
                        console.error("Critical: Parroquias GeoData is missing");
                        return;
                    }

                    let features = Array.isArray(parroquiasGeoData.features) ? parroquiasGeoData.features : [];

                    let cantonParroquias = features.filter(f => {
                        if (!f.properties) return false;
                        return f.properties.CODCAN == idCanton ||
                            String(f.properties.CODCAN) === String(idCanton) ||
                            String(f.properties.CODCAN).replace(/^0+/, '') === String(idCanton).replace(/^0+/, '');
                    });
                    console.log("Filtered Parroquias Count:", cantonParroquias.length);

                    if (cantonParroquias.length === 0) {
                        console.warn("No parroquias found for canton ID:", idCanton);
                        return;
                    }

                    let parroquiaData = {
                        type: "FeatureCollection",
                        crs: parroquiasGeoData.crs,
                        features: cantonParroquias
                    };

                    canton.geodata = parroquiaData;
                    provincia.hide();
                    canton.show();
                    canton.invalidateData();

                } catch (error) {
                    console.error("Error in drill-down (Canton -> Parroquia):", error);
                }
            });

            if (cm == cm2 && cm != 0) {
                provincia.geodataSource.url = `mapa/${cm}/${cm2}.json`;
                provincia.dataSource.url = `Datos/${cv}/${cd}/${cm}/${cm2}.json`;
                prov = cm;
                provincia.geodataSource.load();
                provincia.dataSource.load();
            } else if (cm != cm2) {
                canton.geodataSource.url = `mapa/${cm}/${cm2}.json`;
                canton.dataSource.url = `Datos/${cv}/${cd}/${cm}/${cm2}.json`;
                prov = cm;
                canton.geodataSource.load();
                canton.dataSource.load();
            } else {
                goHome();
            }
        }
    }
}
</script>

<style scoped>
.mapa {
    width: 100%;
    height: 500px;
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
