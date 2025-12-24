// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
// Importar fuentes e iconos (puedes usar CDN en index.html o npm)
import 'material-design-icons-iconfont/dist/material-design-icons.css' 
import '@/styles/EstilosGenerales.css' // Tus estilos globales
const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')