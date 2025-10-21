import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar Bootstrap CSS y JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Importar estilos personalizados
import './assets/styles/main.css'

// Inicializar unique_id al cargar la aplicación
import sessionModule, { getUniqueId } from './session/sessionModule'
getUniqueId()

// Función para chequear validez de sesión al iniciar la app
async function chequearSesionAlIniciar() {
	const { isAuthenticated, verificarSesion, logout } = sessionModule;
	if (isAuthenticated()) {
		const resultado = await verificarSesion();
		if (!resultado.activa) {
			await logout();
		}
	}
}

// Configurar la URL del SSO desde .env

sessionModule.setConfig({
	ssoUrl: import.meta.env.VITE_URL_SSO_SERVICE,
	appBaseUrl: import.meta.env.VITE_APP_BASE,
    storagePrefix: 'app_encuestas_',
});

// Ejecutar chequeo de sesión después de configurar
chequearSesionAlIniciar();

const app = createApp(App)

app.use(router)
app.mount('#app')
