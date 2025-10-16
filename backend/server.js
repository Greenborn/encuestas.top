const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const db = require('./src/database/connection');
    await db.raw('SELECT 1');
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Base: http://localhost:${PORT}/api`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Recibida señal ${signal}. Cerrando servidor...`);
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        try {
          // Cerrar conexión a la base de datos
          await db.destroy();
          console.log('🗄️ Conexión a la base de datos cerrada');
        } catch (error) {
          console.error('❌ Error al cerrar la base de datos:', error);
        }
        
        console.log('✅ Aplicación cerrada correctamente');
        process.exit(0);
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('⚠️ Forzando cierre de la aplicación');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();