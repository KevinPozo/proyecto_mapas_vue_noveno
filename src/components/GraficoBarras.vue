<template>
  <div class="graficobarras_container">
    <div class="titulo-estatico">Gráfica Resultados {{ categoria }}</div>

    <div class="chart-scroll-wrapper" :class="{'modo_centrado': pocosCandidatos}">
      <apexchart
        v-if="chartReady"
        :width="longitud"
        height="110%"
        :options="chartOptions"
        :series="series"
      ></apexchart>

      <div v-else class="loading-container">Cargando datos...</div>
    </div>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import { obtenerTotalesPresidenteFachada } from "@/helpers/procesarVotosHelper";
import { candidatoData } from "@/assets/data/CandidatosData";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    // Array de datos por provincias
    datos: {
      type: Array,
      required: true,
    },
    // Contexto: 'presidentes' o 'asambleistas'
    categoria: {
      type: String,
      default: "candidatos",
    },
  },
  data() {
    return {

      pocosCandidatos: false,

      // Controla si el gráfico debe renderizarse (Evita error destroy null)
      chartReady: false,
      // Variable reactiva para el ancho del gráfico
      longitud: "300%",

      // Configurar Altura de las Barras
      series: [
        {
          name: "Porcentaje Nacional",
          data: [],
        },
      ],
      // Configuración de ApexCharts (El contenido e Imágenes)
      chartOptions: {
        chart: {
          type: "bar",
          redrawOnParentResize: true,
          toolbar: { show: false },
          background: "transparent",
          animations: { enabled: false }, // Desactivar animaciones ayuda en el redibujado
          dropShadow: {
            enabled: true,
            top: 4,
            left: 10,
            blur: 5,
            opacity: 0.8,
          },
        },
        legend: {
          show: false,
        },
        plotOptions: {
          bar: {
            distributed: true,
            borderRadius: 4,
            borderRadiusApplication: "end",
            horizontal: false,
            columnWidth: "25%",
            dataLabels: { position: "top" },
          },
        },
        dataLabels: {
          enabled: false, // MODIFICADO: Lo apagamos para que no se vea sobre la barra
          formatter: (val) => val + " %",
          offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#304758"],
          },
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -45,
            style: { fontSize: "12px" },
            useHTML: true,
          },
        },
        yaxis: { show: false },
        colors: [],
        // CAMBIO: Eliminamos la configuración de 'title' aquí porque ahora es HTML externo
        title: {
          text: undefined,
        },
        annotations: { points: [] },
      },
    };
  },
  watch: {
    datos: {
      handler: "cargarYProcesarDatos",
      deep: true,
    },
    categoria: "cargarYProcesarDatos",
  },
  mounted() {
    this.cargarYProcesarDatos();
  },
  methods: {
    envolverImagenEnCirculo(urlImagen, size = 100, colorBorde = "#ffffff") {
      const renderSize = size * 2; // Super-sampling para HD
      const radius = renderSize / 2;
      const strokeWidth = 8; // Grosor del borde

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        // Si urlImagen es un módulo (require), lo usamos directamente, sino asignamos
        img.src = urlImagen;

        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = renderSize;
          canvas.height = renderSize;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // --- 1. DIBUJAR EL CÍRCULO DE FONDO CON EL COLOR DEL PARTIDO ---
          ctx.beginPath();
          ctx.arc(radius, radius, radius - strokeWidth / 2, 0, Math.PI * 2);
          ctx.fillStyle = colorBorde; // Relleno con el color del partido
          ctx.fill();

          // --- 2. RECORTAR PARA LA IMAGEN ---
          ctx.save();
          ctx.beginPath();
          ctx.arc(radius, radius, radius - strokeWidth, 0, Math.PI * 2);
          ctx.clip();

          // Dibujar imagen (si la imagen tiene transparencia, se verá el fondo de color)
          ctx.drawImage(
            img,
            strokeWidth,
            strokeWidth,
            renderSize - strokeWidth * 2,
            renderSize - strokeWidth * 2
          );
          ctx.restore();

          // --- 3. DIBUJAR EL BORDE PERIMETRAL ---
          ctx.beginPath();
          ctx.arc(radius, radius, radius - strokeWidth / 2, 0, Math.PI * 2);
          ctx.strokeStyle = colorBorde;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();

          resolve(canvas.toDataURL("image/png", 1.0));
        };

        img.onerror = () => {
          // Fallback: Círculo sólido del color del partido si falla la imagen
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = renderSize;
          canvas.height = renderSize;
          ctx.beginPath();
          ctx.arc(radius, radius, radius, 0, Math.PI * 2);
          ctx.fillStyle = colorBorde;
          ctx.fill();
          resolve(canvas.toDataURL());
        };
      });
    },

    obtenerImagen(identificador, esPartido = false) {
      // 1. Buscar en candidatoData la información del candidato/partido
      // Normalizamos la búsqueda para evitar problemas de mayúsculas/tildes
      const candidatoEncontrado = candidatoData.find(c => {
         // Si buscamos por nombre de candidato
         if (!esPartido) return c.nombre === identificador || c.nombre.includes(identificador);
         
         // Si buscamos por partido (identificador = Siglas, ej "ADN")
         // Usamos nombrePartido que ahora contiene las siglas en CandidatosData (ej "ADN")
         return c.nombrePartido === identificador; 
      });

      try {
        if (esPartido) {
            // LOGOS DE PARTIDOS
            // NUEVO: Intentamos buscar en candidatoData si hay un logo definido manualmente
            if (candidatoEncontrado && candidatoEncontrado.logo) {
                return candidatoEncontrado.logo;
            }

            // Fallback anterior: buscar por nombre de archivo (siglas) en carpeta Partidos
             const nombreLimpio = identificador.replace("/", "-");
            return require(`@/assets/img/Partidos/${nombreLimpio}.png`);
        } else {
            // FOTOS DE CANDIDATOS
            if (candidatoEncontrado && candidatoEncontrado.url) {
                return candidatoEncontrado.url;
            }
            return require(`@/assets/img/candidatos/${identificador}.png`);
        }
      } catch (e) {
        // Fallback genérico
        // console.warn ...
        return require(`@/assets/img/Partidos/1.png`); 
      }
    },

    // Procesa los datos y actualiza el gráfico
    async cargarYProcesarDatos() {
      console.log("--- DEBUG GraficoBarras: cargarYProcesarDatos ---");
      if (this.datos && this.datos.length > 0) {
        console.log("Primer item de datos:", JSON.stringify(this.datos[0], null, 2));
      } else {
        console.log("Datos recibidos (length):", this.datos ? this.datos.length : "null");
      }
      
      // Apagamos el gráfico para evitar errores de renderizado/destroy
      this.chartReady = false;

      // Limpiar gráfico si no hay datos
      if (!this.datos || this.datos.length === 0) {
        console.warn("Datos vacíos: Reseteando gráfico");
        this.resetChart();
        this.chartReady = true; // Volvemos a prender aunque esté vacío
        return;
      }

      const resultados = obtenerTotalesPresidenteFachada(
        this.datos,
        this.categoria
      );
      
      console.log("Resultados procesados del Helper:", resultados);
      
      const siglasPartidos = Object.keys(resultados);
      console.log("Siglas encontradas:", siglasPartidos);

      // --- CAMBIO: Ajuste dinámico de longitud ---
      if (siglasPartidos.length <= 2) {
        this.longitud = "50%"; // Para segunda vuelta
        this.pocosCandidatos = true;
      } else {
        this.longitud = "300%"; // Para primera vuelta
        this.pocosCandidatos = false;
      }

      // --- CAMBIO: Creamos un array vacío para llenar con dos tipos de puntos por cada partido ---
      const todosLosPuntos = [];

      // Usar Promise.all para procesar todas las imágenes
      const puntosPromises = siglasPartidos.map(async (sigla) => {
        const item = resultados[sigla];
        const puntos = [];

        // 1. IMAGEN DEL PARTIDO (Arriba) - Código que ya tienes
        puntos.push({
          x: item.candidato,
          y: item.porcentaje,
          marker: { size: -1 },
          image: {
            path: this.obtenerImagen(sigla, true),
            width: 80,
            height: 80,
            offsetY: -55,
          },
        });

        // 2. IMAGEN DEL CANDIDATO (Abajo) - Código que ya tienes
        const imgCandidato = this.obtenerImagen(item.candidato, false);
        const imagenCircular = await this.envolverImagenEnCirculo(
          imgCandidato,
          80,
          resultados[sigla].color
        );
        puntos.push({
          x: item.candidato,
          y: 0,
          marker: { size: -1 },
          image: {
            path: imagenCircular,
            width: 85,
            height: 85,
            offsetY: 50,
          },
        });

        // --- NUEVO: 3. TEXTO DEL PORCENTAJE (Debajo del nombre) ---
        puntos.push({
          x: item.candidato,
          y: 0, // Anclado a la base
          marker: { size: -1 }, // Sin punto visible
          label: {
            text: item.porcentaje + " %",
            offsetY: 160, // Lo bajamos para que quede debajo del nombre del eje X
            borderColor: "transparent",
            style: {
              color: item.color, // <-- AQUÍ USAMOS EL COLOR DE LA BARRA
              background: "transparent",
              fontSize: "25px",
              fontWeight: "900",
            },
          },
        });

        return puntos;
      });

      const puntosAnidados = await Promise.all(puntosPromises);
      const todosLosPuntosFinales = puntosAnidados.flat();

      // Conservar la Estructura, y poner sus Implementaciones
      this.chartOptions = {
        ...this.chartOptions,
        // COLORES DINÁMICOS
        colors: siglasPartidos.map((sigla) => resultados[sigla].color),
        // --- AGREGADO: Espaciado interno ---
        grid: {
          show: false,
          padding: {
            top: 50, // Reducimos el top ya que el título está afuera
            bottom: 200, // Aumentado de 150 a 200 para dar más espacio al texto más abajo
          },
        },
        xaxis: {
          ...this.chartOptions.xaxis,
          categories: siglasPartidos.map((p) => resultados[p].candidato),
          labels: {
            ...this.chartOptions.xaxis.labels,
            offsetY: 46, // Ajusta según necesites
            useHTML: false, // VOLVEMOS A FALSE
            formatter: (val) => val, // SOLO EL NOMBRE
            style: {
              ...this.chartOptions.xaxis.labels.style,
              fontSize: "18px",
              fontWeight: "bold",
              colors: ["#2D3748"], // Color oscuro para todos los nombres
            },
          },
        },
        // CAMBIO: Eliminamos el title interno
        title: {
          text: undefined,
        },
        annotations: {
          ...this.chartOptions.annotations,
          // CAMBIO: Eliminamos texts (el cuadro azul interno) y dejamos solo los puntos (imágenes)
          points: todosLosPuntosFinales,
        },
      };

      this.series = [
        {
          name: "Porcentaje Nacional",
          data: siglasPartidos.map((p) => resultados[p].porcentaje),
        },
      ];

      // 2. Encendemos el gráfico
      this.chartReady = true;
    },

    resetChart() {
      this.series = [{ name: "Porcentaje Nacional", data: [] }];
      this.chartOptions = {
        ...this.chartOptions,
        xaxis: {
          ...this.chartOptions.xaxis,
          categories: [],
        },
        annotations: {
          points: [],
        },
      };
    },
  },
};
</script>

<style scoped>
.graficobarras_container {
  width: 100%;
  height: 100%;
  padding: 10px; /* Reducir padding para panel lateral */
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.503);
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  min-height: 400px; /* Asegurar altura mínima */
}

.titulo-estatico {
  text-transform: capitalize;
  background-color: #1ba7c9;
  color: #ffffff;
  font-size: 30px;
  font-weight: 700;
  padding: 15px 70px;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 20px; /* Separación con el gráfico */
  white-space: nowrap; /* Evita que el texto se rompa */
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-container {
  text-align: center;
  margin-top: 50px;
  color: #666;
  font-size: 1.2rem;
}

/* CAMBIO IMPORTANTE: */
.vue-apexcharts {
  display: flex;
  justify-content: flex-start; /* <--- CAMBIA 'center' POR 'flex-start' */
  width: 100%; 
  margin: auto;
}

/* AGREGA ESTA CLASE NUEVA AL FINAL DE TU CSS: */
.modo_centrado {
  display: flex;
  justify-content: center; /* Esto centra solo cuando hay pocos datos */
}

.modo_centrado .vue-apexcharts {
  justify-content: center; /* Fuerza al gráfico a centrarse */
}


/* Quitamos el justify-content: center para que el scroll empiece desde la izquierda */
.graficobarras_container > div.chart-scroll-wrapper {
  width: 100% !important;
  flex: 1; /* Ocupa el espacio restante */
}

/* 1. CONTENEDOR DEL SCROLL */
.chart-scroll-wrapper {
  width: 100%;
  height: 100%;
  overflow-x: auto; /* Habilita el desplazamiento horizontal */
  overflow-y: hidden;
  display: block;
  flex: 1;
}

/* 2. GROSOR DEL DESLIZADOR (Lo hacemos más alto) */
.chart-scroll-wrapper::-webkit-scrollbar {
  height: 18px; /* Aumentado a 20px para que sea más fácil de ver y usar */
}

/* 3. FLECHAS DE NAVEGACIÓN (Botones izquierdo y derecho) */
.chart-scroll-wrapper::-webkit-scrollbar-button:single-button {
  display: block;
  background-size: 12px;
  background-repeat: no-repeat;
  background-position: center;
  width: 25px; /* Ancho del botón de la flecha */
  background-color: #f1f1f1; /* Fondo de la flecha */
}

/* Flecha izquierda (Decremento) */
.chart-scroll-wrapper::-webkit-scrollbar-button:single-button:horizontal:decrement {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%238b8b8b'><polygon points='70,20 20,50 70,80'/></svg>");
  border-radius: 10px 0 0 10px;
}

/* Flecha derecha (Incremento) */
.chart-scroll-wrapper::-webkit-scrollbar-button:single-button:horizontal:increment {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%238b8b8b'><polygon points='30,20 80,50 30,80'/></svg>");
  border-radius: 0 10px 10px 0;
}

/* 4. EL DESLIZADOR (La pieza que se arrastra) */
.chart-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #8b8b8b; 
  border-radius: 10px;
  border: 3px solid #f1f1f1; 
}

.chart-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #666; 
}

.chart-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0;
}
</style>