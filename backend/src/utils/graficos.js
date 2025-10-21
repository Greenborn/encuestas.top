const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Función para generar gráfico de resultados
async function generarGraficoResultados({ opciones, tipo = 'pie', width = 600, height = 400 }) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const labels = opciones.map(o => o.texto_opcion);
  const data = opciones.map(o => o.votos);
  const backgroundColor = opciones.map(o => o.color || '#74ACDF');

  const config = {
    type: tipo,
    data: {
      labels,
      datasets: [{
        label: 'Votos',
        data,
        backgroundColor,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = data.reduce((sum, v) => sum + v, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} votos (${percentage}%)`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  };

  if (tipo === 'bar') {
    config.options.scales = {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    };
  }

  // Renderizar como buffer PNG
  return await chartJSNodeCanvas.renderToBuffer(config);
}

module.exports = { generarGraficoResultados };