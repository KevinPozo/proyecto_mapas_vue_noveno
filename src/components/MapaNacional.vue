<template>
  <v-sheet class="position-relative overflow-hidden">
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      width="300"
      color="#12a2c2"
      dark
    >
      <v-container class="contenedor-filtros">
        <h3
          class="mb-4 text-uppercase"
          style="font-family: 'Oswald', sans-serif"
        >
          SELECCIONAR EN FILTRO
        </h3>

        <div class="texto-filtro">VUELTA*</div>
        <v-select
          v-model="type"
          :items="types"
          outlined
          dense
          background-color="rgba(255,255,255,0.1)"
          hide-details
          dark
          class="mb-1"
        ></v-select>
        <div class="mb-4 white--text caption">Seleccionado: {{ type }}</div>

        <div class="texto-filtro">PARTIDO POLITICO*</div>
        <v-select
          v-model="partido"
          :items="arregloPartido"
          outlined
          dense
          background-color="rgba(255,255,255,0.1)"
          hide-details
          dark
          class="mb-1"
        ></v-select>
        <div class="mb-4 white--text caption">Seleccionado: {{ partido }}</div>

        <div :items="`${selectProv()}`"></div>

        <div class="texto-filtro">PROVINCIA*</div>
        <v-select
          v-model="select"
          :items="provs"
          outlined
          dense
          background-color="rgba(255,255,255,0.1)"
          hide-details
          dark
          class="mb-1"
        ></v-select>
        <div class="mb-4 white--text caption">Seleccionado: {{ select }}</div>

        <div class="texto-filtro">CANTÓN</div>
        <v-select
          v-model="select2"
          :items="cantons"
          outlined
          dense
          background-color="rgba(255,255,255,0.1)"
          hide-details
          dark
          class="mb-1"
        ></v-select>
        <div class="mb-6 white--text caption">Seleccionado: {{ select2 }}</div>

        <p class="caption white--text">*Campo Obligatorio</p>

        <v-btn
          block
          color="white"
          light
          class="font-weight-bold"
          style="font-family: 'Oswald', sans-serif"
          @click="datosBusqueda2()"
        >
          BUSCAR
        </v-btn>
      </v-container>
    </v-navigation-drawer>

    <v-btn
      color="#12a2c2"
      dark
      fab
      small
      absolute
      top
      left
      style="top: 20px; left: 20px; z-index: 5"
      @click="drawer = !drawer"
    >
      <v-icon>search</v-icon>
    </v-btn>

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
                      {{ this.titulo }}
                    </div>
                  </v-card>
                </div>

                <div class="contenedor-botones-vuelta">
                  <v-btn
                    tile
                    class="btn-vuelta"
                    :class="
                      expand ? 'btn-vuelta-activo' : 'btn-vuelta-inactivo'
                    "
                    @click="primeraV"
                  >
                    PRIMERA VUELTA
                  </v-btn>

                  <v-btn
                    tile
                    class="btn-vuelta"
                    :class="
                      !expand ? 'btn-vuelta-activo' : 'btn-vuelta-inactivo'
                    "
                    @click="segundaV"
                  >
                    SEGUNDA VUELTA
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="9">
              <MapaEcuador
                :id_1="id_codMapa"
                :datos="mockDatos"
                :geoProvincias="geoProvincias"
                :geoCantones="geoCantones"
                :geoParroquias="geoParroquias"
                @mapaTitulo="(i) => (tituloMapa = i)"
              />
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
import MapaEcuador from "./MapaEcuador";
import { DATOS_MOCK_ECUADOR } from "@/assets/Informacion/DatosMockEcuador";

const DUMMY_PROVINCIAS = [
  {
    provincia: "AZUAY",
    id: "01",
    ncantones: ["Cuenca", "Gualaceo"],
    cantones: [
      { nombre: "Cuenca", idcan: "01" },
      { nombre: "Gualaceo", idcan: "02" },
    ],
  },
  {
    provincia: "PICHINCHA",
    id: "17",
    ncantones: ["Quito", "Cayambe"],
    cantones: [
      { nombre: "Quito", idcan: "01" },
      { nombre: "Cayambe", idcan: "02" },
    ],
  },
];
const DUMMY_CANDIDATOS = [
  { nombrePartido: "Resultados Generales", json: "" },
  { nombrePartido: "Partido A", json: "1" },
  { nombrePartido: "Partido B", json: "2" },
  { nombrePartido: "Partido C", json: "3" },
];

export default {
  name: "MapaNacional",
  props: {
    geoProvincias: { type: Object, required: true },
    geoCantones: { type: Object, required: true },
    geoParroquias: { type: Object, required: true },
    expand_b: String,
    expand2_b: String,
  },
  data() {
    var vuelta = ["1", "2"];
    const provincia = DUMMY_PROVINCIAS;
    const candidato = DUMMY_CANDIDATOS;

    return {
      select: "",
      select2: "",
      type: "",
      provs: [],
      cantons: [],
      types: vuelta,
      arregloPartido: [],
      partido: "",
      arreglo_prov: provincia,
      candidatos: candidato,
      drawer: null,
      numvuelta: "2",
      id_codMapa: [],
      aux_prov: [],
      aux_prov2: [],
      aux_canton: [],
      aux_idprov: [],
      auxpartido: [],
      auxpartido2: [],
      expand: true,
      tituloMapa: "0",
      titulo: "Resultados Nacionales 1996",
      mockDatos: DATOS_MOCK_ECUADOR,
    };
  },

  components: { MapaEcuador },

  computed: {
    datosParaMapa() {
      return [];
    },
  },

  methods: {
    limpiar() {
      this.type = "";
      this.select = "";
      this.select2 = "";
      this.partido = "";
      this.primeraV();
      this.drawer = false;
    },
    primeraV() {
      this.expand = true;
      this.$emit("add", 0);
      this.numvuelta = "1";
      this.titulo = "Resultados Nacionales 1996";
      this.id_codMapa = ["1raVuelta", "", "", ""];
    },
    segundaV() {
      this.expand = false;
      this.asignarTitulo2();
      this.$emit("add", 1);

      this.numvuelta = "2";
      this.titulo = "Resultados Nacionales 1996";

      this.id_codMapa = ["2daVuelta", "", "", ""];
    },

    datosBusqueda2() {
      let varVuelta = this.type == "1" ? "1raVuelta" : "2daVuelta";
      this.type == "1" ? (this.expand = true) : (this.expand = false);
      let politico = this.candidatos.find(
        (elemento) => elemento.nombrePartido === this.partido
      );

      let condicionPartido =
        politico && politico.nombrePartido == "Resultados Generales"
          ? ""
          : politico
          ? politico.json
          : "";

      if (this.select == "") {
        this.id_codMapa = [varVuelta, condicionPartido, "", ""];
        this.drawer = false;
      } else if (this.select2 == "") {
        const resultado = this.arreglo_prov.find(
          (varProvincia) => varProvincia.provincia === this.select
        );
        if (resultado) {
          this.id_codMapa = [
            varVuelta,
            condicionPartido,
            resultado.id,
            resultado.id,
          ];
        }
      } else {
        const resultado = this.arreglo_prov.find(
          (varProvincia) => varProvincia.provincia === this.select
        );
        if (resultado) {
          const arregloCantones = resultado.cantones;
          const cantonSelect = arregloCantones.find(
            (varCanton) => varCanton.nombre === this.select2
          );
          if (cantonSelect) {
            this.id_codMapa = [
              varVuelta,
              condicionPartido,
              resultado.id,
              cantonSelect.idcan,
            ];
          }
        }
        this.drawer = false;
      }

      this.asignarTitulo();
      this.drawer = false;
      this.select2 = "";
    },
    asignarTitulo() {
      const textoTitulo = this.arreglo_prov.find(
        (datos) => datos.id === this.id_codMapa[2]
      );
      if (!textoTitulo) return;

      const arregloTexto = textoTitulo.cantones;
      const textCanton = arregloTexto
        ? arregloTexto.find(
            (datosCanton) => datosCanton.idcan === this.id_codMapa[3]
          )
        : null;
      let condicionTexto =
        this.select2 != "" && textCanton
          ? textCanton.nombre
          : textoTitulo.provincia;
      this.titulo = "RESULTADOS " + condicionTexto;
    },
    asignarTitulo2() {},
    selectProv() {
      if (!this.candidatos || !this.arreglo_prov) return;

      this.auxpartido = this.candidatos.map((c) => c.nombrePartido);
      this.auxpartido2 = this.candidatos
        .slice(0, 3)
        .map((c) => c.nombrePartido);

      if (this.type == "1" || this.type == "2") {
        this.arregloPartido =
          this.type == "1" ? this.auxpartido : this.auxpartido2;

        this.aux_prov = this.arreglo_prov.map((p) => p.provincia);
        this.provs = this.aux_prov;

        const selectedProvData = this.arreglo_prov.find(
          (p) => p.provincia === this.select
        );
        if (selectedProvData) {
          this.aux_canton = selectedProvData.ncantones;
          this.cantons = this.aux_canton;
        }
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Oswald&display=swap");
</style>
|