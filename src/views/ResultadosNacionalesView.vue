<template>
  <div>
    <MapaNacional
      :geoProvincias="geoProvincias"
      :geoCantones="geoCantones"
      :geoParroquias="geoParroquias"
      :resultadosProvincias="resultadosProvincias"
      :resultadosCantones="resultadosCantones"
      :resultadosParroquias="resultadosParroquias"
      :colores="coloresMap"
    />
  </div>
</template>

<script>
import MapaNacional from "@/components/MapaElectoral.vue";
import geoProvincias from "@/assets/1996/MapaNacional/ProvinciasEcu.json";
import geoCantones from "@/assets/1996/MapaNacional/CantonesEcu.json";
import geoParroquias from "@/assets/1996/MapaNacional/ParroquiasEcu.json";

import resultadosProvincias from "@/assets/1996/Datos/PrimeraVuelta/Datos2025Provincias.json";
import resultadosCantones from "@/assets/1996/Datos/PrimeraVuelta/Datos2025Cantones.json";
import resultadosParroquias from "@/assets/1996/Datos/PrimeraVuelta/Datos2025Parroquias.json";

import { COLORES_PARTIDOS } from "@/assets/Informacion/ColoresPartidos";

export default {
  name: "ResultadosNacionalesView",
  components: {
    MapaNacional,
  },
  data() {
    const coloresMap = {
      ADN: COLORES_PARTIDOS["ADN"],
      RC: COLORES_PARTIDOS["RC/RETO"],
      "RC/RETO": COLORES_PARTIDOS["RC/RETO"],
      PSC: COLORES_PARTIDOS["PSC"],
      SUMA: COLORES_PARTIDOS["SUMA"],
      MUPP: COLORES_PARTIDOS["PK-UP"],
      ID: COLORES_PARTIDOS["ID"],
      CONSTRUYE: COLORES_PARTIDOS[11],
      PSP: COLORES_PARTIDOS["PSP"],
      AMIGO: COLORES_PARTIDOS["M. AMIGO"],
      AVANZA: COLORES_PARTIDOS["AVANZA"],
      PAIS: COLORES_PARTIDOS["PAIS"],
    };

    return {
      geoProvincias,
      geoCantones,
      geoParroquias,
      resultadosProvincias,
      resultadosCantones,
      resultadosParroquias,
      coloresMap,
    };
  },
};
</script>