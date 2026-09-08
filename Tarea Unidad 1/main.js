document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      alert('Prueba de funcionalidad: Botón "Comenzar Ahora" presionado');
    });
  }
});