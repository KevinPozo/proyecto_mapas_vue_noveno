import { createRouter, createWebHistory } from "vue-router";

import PaginaResultadosExtranjero from "@/views/PaginaResultadosExtranjero1996.vue";
import PaginaResultadoNacional from "@/views/PaginaResultadosNacional1996.vue";
import VistaCarrusel from "@/views/VistaCarrusel.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: PaginaResultadoNacional,
  },
  {
    path: "/extranjero",
    name: "Extranjero",
    component: PaginaResultadosExtranjero,
  },
  {
    path: "/carrusel",
    name: "Carrusel",
    component: VistaCarrusel,
  },
];
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
export default router;
