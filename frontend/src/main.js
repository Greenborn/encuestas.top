import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar Bootstrap CSS y JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Importar estilos personalizados
import './assets/styles/main.css'

// Inicializar unique_id al cargar la aplicación
import { getUniqueId } from './utils/session'
getUniqueId()

const app = createApp(App)

app.use(router)

app.mount('#app')
