<template>
  <div>
    <h2>Redireccionando...</h2>
    <p v-if="loading">Procesando autenticación...</p>
    <p v-if="error">{{ error }}</p>
    <p v-if="success">¡Bienvenido, {{ userName }}!</p>
  </div>
</template>

<script setup>
import sessionModule from '../../session/sessionModule';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const loading = ref(true);
const error = ref('');
const success = ref(false);
const userName = ref('');

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const token = route.query.token;
  const uniqueId = route.query.unique_id;
  if (!token || !uniqueId) {
    error.value = 'Faltan parámetros en la URL.';
    loading.value = false;
    return;
  }
  const sessionUrl = sessionModule.getSSOUrl() + '/auth/login';
  try {
    const response = await fetch(sessionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const result = await response.json();
    if (result.success) {
      sessionModule.saveSession({
        bearer_token: result.data.bearer_token,
        expires_at: result.data.expires_at,
        user: result.data.user
      });
      success.value = true;
      userName.value = result.data.user.name;
      const redirectUrl = localStorage.getItem('app_mascota_url_login_redirect');
      if (redirectUrl && redirectUrl.startsWith('/')) {
        router.replace(redirectUrl);
      } else {
        router.replace('/');
      }
    } else {
      error.value = 'Error de autenticación. Contacte soporte técnico.';
    }
  } catch (e) {
    console.log(e)
    error.value = 'No se pudo conectar con el servidor de autenticación.';
  }
  loading.value = false;
});
</script>
