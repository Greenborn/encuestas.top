<template>
  <div class="modal-backdrop" @click.self="onCancel">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Confirmar Voto</h3>
          <button type="button" class="btn-close" @click="onCancel"></button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro que quieres votar por la opción:</p>
          <div class="opcion-seleccionada">
            <span class="color" :style="{ backgroundColor: opcion.color }"></span>
            <span class="texto">{{ opcion.texto_opcion }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="onCancel">Cancelar</button>
          <button class="btn btn-primary" @click="onConfirm">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  opcion: { type: Object, required: true }
})
const emit = defineEmits(['confirm', 'cancel'])
const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1050;
}
.modal-dialog {
  max-width: 400px; width: 100%;
}
.modal-content {
  background: white; border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.modal-header {
  background: #0057B7; color: white; padding: 1rem;
  display: flex; justify-content: space-between; align-items: center;
}
.btn-close {
  background: white; border-radius: 50%; padding: 0.3rem 0.6rem;
}
.modal-body { padding: 1.5rem; }
.opcion-seleccionada {
  display: flex; align-items: center; gap: 1rem;
  margin-top: 1rem; font-size: 1.1rem;
}
.color {
  width: 32px; height: 32px; border-radius: 8px;
  display: inline-block;
}
.texto { font-weight: 600; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 1rem;
  padding: 1rem 1.5rem; background: #f8f9fa;
}
</style>
