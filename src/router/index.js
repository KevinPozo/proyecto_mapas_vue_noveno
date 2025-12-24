// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
// Importamos la vista que te di antes
// Asegúrate de crear el archivo PaginaResultadosExtranjero.vue en src/views/
import PaginaResultadosExtranjero from '@/views/PaginaResultadosExtranjero.vue'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: PaginaResultadosExtranjero // O tu página de inicio
  },
  {
    path: '/extranjero',
    name: 'Extranjero',
    component: PaginaResultadosExtranjero
  }
]
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
export default router