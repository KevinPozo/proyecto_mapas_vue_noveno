import { createRouter, createWebHistory } from "vue-router";

import PaginaResultadosExtranjero from "@/views/PaginaResultadosExtranjero.vue";
import PaginaResultadosNacionales from "@/views/ResultadosNacionalesView.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: PaginaResultadosNacionales,
  },
  {
    path: "/extranjero",
    name: "Extranjero",
    component: PaginaResultadosExtranjero,
  },
];
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
export default router;
