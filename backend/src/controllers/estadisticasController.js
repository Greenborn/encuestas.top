const db = require('../database/connection');

class EstadisticasController {
  // Obtener estadísticas generales del sistema
  static async obtenerEstadisticasGenerales(req, res) {
    try {
      // Total de encuestas
      const totalEncuestas = await db('encuesta').count('id_encuesta as count').first();
      
      // Total de votos
      const totalVotos = await db('voto_encuesta').count('id as count').first();
      
      // Encuestas más populares (top 10)
      const encuestasPopulares = await db('encuesta')
        .select('encuesta.id_encuesta', 'encuesta.titulo', 'encuesta.descripcion')
        .count('voto_encuesta.id as total_votos')
        .leftJoin('voto_encuesta', 'encuesta.id_encuesta', 'voto_encuesta.id_encuesta')
        .groupBy('encuesta.id_encuesta', 'encuesta.titulo', 'encuesta.descripcion')
        .orderBy('total_votos', 'desc')
        .limit(10);

      // Encuestas recientes (últimas 10)
      const encuestasRecientes = await db('encuesta')
        .select('id_encuesta', 'titulo', 'descripcion', 'fecha_creacion')
        .orderBy('fecha_creacion', 'desc')
        .limit(10);

      // Estadísticas por día (últimos 30 días)
      const estadisticasDiarias = await db.raw(`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as encuestas_creadas
        FROM encuesta 
        WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha DESC
      `);

      res.json({
        success: true,
        data: {
          totales: {
            encuestas: parseInt(totalEncuestas.count),
            votos: parseInt(totalVotos.count)
          },
          encuestas_populares: encuestasPopulares,
          encuestas_recientes: encuestasRecientes,
          estadisticas_diarias: estadisticasDiarias[0]
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas detalladas de una encuesta específica
  static async obtenerEstadisticasEncuesta(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la encuesta existe
      const encuesta = await db('encuesta')
        .where('id_encuesta', id)
        .first();

      if (!encuesta) {
        return res.status(404).json({
          success: false,
          message: 'Encuesta no encontrada'
        });
      }

      // Obtener estadísticas de votos por opción
      const estadisticasOpciones = await db('opcion_encuesta')
        .select(
          'opcion_encuesta.id_opcion',
          'opcion_encuesta.texto_opcion',
          'opcion_encuesta.color'
        )
        .count('voto_encuesta.id as total_votos')
        .leftJoin('voto_encuesta', 'opcion_encuesta.id_opcion', 'voto_encuesta.id_opcion')
        .where('opcion_encuesta.id_encuesta', id)
        .groupBy('opcion_encuesta.id_opcion', 'opcion_encuesta.texto_opcion', 'opcion_encuesta.color')
        .orderBy('total_votos', 'desc');

      // Calcular porcentajes
      const totalVotos = estadisticasOpciones.reduce((sum, opcion) => sum + parseInt(opcion.total_votos), 0);
      
      const opcionesConPorcentaje = estadisticasOpciones.map(opcion => ({
        ...opcion,
        total_votos: parseInt(opcion.total_votos),
        porcentaje: totalVotos > 0 ? ((parseInt(opcion.total_votos) / totalVotos) * 100).toFixed(2) : '0.00'
      }));

      // Estadísticas de votos por día
      const votosPorDia = await db.raw(`
        SELECT 
          DATE(fecha_creacion) as fecha,
          COUNT(*) as votos
        FROM voto_encuesta 
        WHERE id_encuesta = ?
        GROUP BY DATE(fecha_creacion)
        ORDER BY fecha ASC
      `, [id]);

      // Estadísticas de votos por hora (últimas 24 horas)
      const votosPorHora = await db.raw(`
        SELECT 
          HOUR(fecha_creacion) as hora,
          COUNT(*) as votos
        FROM voto_encuesta 
        WHERE id_encuesta = ? 
          AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY HOUR(fecha_creacion)
        ORDER BY hora ASC
      `, [id]);

      res.json({
        success: true,
        data: {
          encuesta: {
            id_encuesta: encuesta.id_encuesta,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            fecha_creacion: encuesta.fecha_creacion,
            fecha_finalizacion: encuesta.fecha_finalizacion
          },
          estadisticas: {
            total_votos: totalVotos,
            opciones: opcionesConPorcentaje,
            votos_por_dia: votosPorDia[0],
            votos_por_hora: votosPorHora[0]
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de encuesta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener resumen de actividad del usuario
  static async obtenerResumenUsuario(req, res) {
    try {
      const userId = req.user.unique_id;

      // Total de encuestas creadas por el usuario
      const totalEncuestasCreadas = await db('encuesta')
        .where('id_usuario', userId)
        .count('id_encuesta as count')
        .first();

      // Total de votos realizados por el usuario
      const totalVotosRealizados = await db('voto_encuesta')
        .where('id_usuario', userId)
        .count('id as count')
        .first();

      // Encuestas del usuario con más votos
      const encuestasPopulares = await db('encuesta')
        .select('encuesta.id_encuesta', 'encuesta.titulo', 'encuesta.fecha_creacion')
        .count('voto_encuesta.id as total_votos')
        .leftJoin('voto_encuesta', 'encuesta.id_encuesta', 'voto_encuesta.id_encuesta')
        .where('encuesta.id_usuario', userId)
        .groupBy('encuesta.id_encuesta', 'encuesta.titulo', 'encuesta.fecha_creacion')
        .orderBy('total_votos', 'desc')
        .limit(5);

      // Actividad reciente del usuario (últimos votos)
      const actividadReciente = await db('voto_encuesta')
        .select('voto_encuesta.fecha_creacion', 'encuesta.titulo', 'opcion_encuesta.texto_opcion')
        .join('encuesta', 'voto_encuesta.id_encuesta', 'encuesta.id_encuesta')
        .join('opcion_encuesta', 'voto_encuesta.id_opcion', 'opcion_encuesta.id_opcion')
        .where('voto_encuesta.id_usuario', userId)
        .orderBy('voto_encuesta.fecha_creacion', 'desc')
        .limit(10);

      res.json({
        success: true,
        data: {
          resumen: {
            encuestas_creadas: parseInt(totalEncuestasCreadas.count),
            votos_realizados: parseInt(totalVotosRealizados.count)
          },
          encuestas_populares: encuestasPopulares.map(encuesta => ({
            ...encuesta,
            total_votos: parseInt(encuesta.total_votos)
          })),
          actividad_reciente: actividadReciente
        }
      });

    } catch (error) {
      console.error('Error al obtener resumen de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = EstadisticasController;