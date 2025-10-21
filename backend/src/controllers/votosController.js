const db = require('../database/connection');
const { body, validationResult } = require('express-validator');

class VotosController {

  /**
   * Votar por una opción en una encuesta
   * POST /api/encuestas/:id/votar
   */
  static async votar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { id_opcion } = req.body;
      const userId = req.user.id;

      // Verificar que la encuesta existe
      const encuesta = await db('encuesta')
        .where('id_encuesta', id)
        .first();

      if (!encuesta) {
        return res.status(404).json({
          success: false,
          message: 'Encuesta no encontrada',
          error: 'POLL_NOT_FOUND'
        });
      }

      // Verificar que la encuesta no haya finalizado
      if (encuesta.fecha_finalizacion && new Date(encuesta.fecha_finalizacion) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'La encuesta ha finalizado',
          error: 'POLL_FINISHED'
        });
      }

      // Verificar que la opción existe y pertenece a la encuesta
      const opcion = await db('opcion_encuesta')
        .where({
          id_opcion,
          id_encuesta: id
        })
        .first();

      if (!opcion) {
        return res.status(404).json({
          success: false,
          message: 'Opción no encontrada',
          error: 'OPTION_NOT_FOUND'
        });
      }

      // Verificar que el usuario no haya votado ya en esta encuesta
      const votoExistente = await db('voto_encuesta')
        .where({
          id_encuesta: id,
          id_usuario: userId
        })
        .first();

      if (votoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya has votado en esta encuesta',
          error: 'ALREADY_VOTED'
        });
      }

      // Registrar el voto
      await db('voto_encuesta').insert({
        id_opcion,
        id_encuesta: id,
        id_usuario: userId
      });

      // Actualizar resultado preliminar
      await VotosController.actualizarResultadoPreliminar(id);

      // Generar gráfico actualizado y guardarlo como imagen
      const opcionesGrafico = await db('opcion_encuesta')
        .select(
          'opcion_encuesta.id_opcion',
          'opcion_encuesta.texto_opcion',
          'opcion_encuesta.color',
          db.raw('COUNT(voto_encuesta.id) as votos')
        )
        .leftJoin('voto_encuesta', 'opcion_encuesta.id_opcion', 'voto_encuesta.id_opcion')
        .where('opcion_encuesta.id_encuesta', id)
        .groupBy('opcion_encuesta.id_opcion');

      const { generarGraficoResultados } = require('../utils/graficos');
      const fs = require('fs');
      const path = require('path');
      const buffer = await generarGraficoResultados({ opciones: opcionesGrafico, tipo: 'pie', width: 600, height: 400 });
      const outputDir = path.join(__dirname, '../../public/graficos');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, `grafico_encuesta_${id}.png`);
      fs.writeFileSync(outputPath, buffer);

      // Obtener información actualizada de la opción votada
      const opcionActualizada = await db('opcion_encuesta')
        .select(
          'opcion_encuesta.*',
          db.raw('COUNT(voto_encuesta.id) as votos')
        )
        .leftJoin('voto_encuesta', 'opcion_encuesta.id_opcion', 'voto_encuesta.id_opcion')
        .where('opcion_encuesta.id_opcion', id_opcion)
        .groupBy('opcion_encuesta.id_opcion')
        .first();

      res.status(201).json({
        success: true,
        message: 'Voto registrado exitosamente',
        data: {
          voto: {
            id_opcion,
            id_encuesta: id,
            fecha_creacion: new Date()
          },
          opcion_votada: {
            ...opcionActualizada,
            votos: parseInt(opcionActualizada.votos)
          }
        }
      });

    } catch (error) {
      console.error('Error al registrar voto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Obtener resultados de la encuesta
   * GET /api/encuestas/:id/resultados
   */
  static async obtenerResultados(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la encuesta existe
      const encuesta = await db('encuesta')
        .select('encuesta.*')
        .where('encuesta.id_encuesta', id)
        .first();

      if (!encuesta) {
        return res.status(404).json({
          success: false,
          message: 'Encuesta no encontrada',
          error: 'POLL_NOT_FOUND'
        });
      }

      // Obtener opciones con conteo de votos
      const opciones = await db('opcion_encuesta')
        .select(
          'opcion_encuesta.*',
          db.raw('COUNT(voto_encuesta.id) as votos')
        )
        .leftJoin('voto_encuesta', 'opcion_encuesta.id_opcion', 'voto_encuesta.id_opcion')
        .where('opcion_encuesta.id_encuesta', id)
        .groupBy('opcion_encuesta.id_opcion')
        .orderBy('opcion_encuesta.id_opcion');

      // Calcular estadísticas
      const totalVotos = opciones.reduce((sum, opcion) => sum + parseInt(opcion.votos), 0);
      
      const opcionesConEstadisticas = opciones.map(opcion => {
        const votos = parseInt(opcion.votos);
        const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(2) : 0;
        
        return {
          ...opcion,
          votos,
          porcentaje: parseFloat(porcentaje)
        };
      });

      // Encontrar la opción ganadora
      const opcionGanadora = opcionesConEstadisticas.reduce((max, opcion) => 
        opcion.votos > max.votos ? opcion : max, opcionesConEstadisticas[0]);

      // Obtener votos por fecha para gráfico temporal
      const votosPorFecha = await db('voto_encuesta')
        .select(
          db.raw('DATE(fecha_creacion) as fecha'),
          db.raw('COUNT(*) as votos_dia')
        )
        .where('id_encuesta', id)
        .groupBy(db.raw('DATE(fecha_creacion)'))
        .orderBy('fecha');

      // Actualizar resultado preliminar en la base de datos
      const resultadoPreliminar = opcionesConEstadisticas.reduce((acc, opcion) => {
        acc[opcion.id_opcion] = {
          texto: opcion.texto_opcion,
          votos: opcion.votos,
          porcentaje: opcion.porcentaje
        };
        return acc;
      }, {});

      await db('encuesta')
        .where('id_encuesta', id)
        .update({
          resultado_preliminar: JSON.stringify(resultadoPreliminar)
        });

      res.json({
        success: true,
        data: {
          encuesta: {
            id_encuesta: encuesta.id_encuesta,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            fecha_creacion: encuesta.fecha_creacion,
            fecha_finalizacion: encuesta.fecha_finalizacion,
            // nombre_creador eliminado
            finalizada: encuesta.fecha_finalizacion && new Date(encuesta.fecha_finalizacion) <= new Date()
          },
          resultados: {
            opciones: opcionesConEstadisticas,
            total_votos: totalVotos,
            opcion_ganadora: totalVotos > 0 ? opcionGanadora : null,
            votos_por_fecha: votosPorFecha
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener resultados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Obtener historial de votos del usuario
   * GET /api/mis-votos
   */
  static async obtenerMisVotos(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Obtener votos del usuario con información de encuestas
      const votos = await db('voto_encuesta')
        .select(
          'voto_encuesta.*',
          'encuesta.titulo as titulo_encuesta',
          'encuesta.descripcion as descripcion_encuesta',
          'opcion_encuesta.texto_opcion',
          'opcion_encuesta.color'
        )
        .join('encuesta', 'voto_encuesta.id_encuesta', 'encuesta.id_encuesta')
        .join('opcion_encuesta', 'voto_encuesta.id_opcion', 'opcion_encuesta.id_opcion')
        .where('voto_encuesta.id_usuario', userId)
        .orderBy('voto_encuesta.fecha_creacion', 'desc')
        .limit(limit)
        .offset(offset);

      // Contar total de votos
      const totalVotos = await db('voto_encuesta')
        .where('id_usuario', userId)
        .count('* as count')
        .first();

      res.json({
        success: true,
        data: {
          votos,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalVotos.count,
            pages: Math.ceil(totalVotos.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener historial de votos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Método auxiliar para actualizar resultado preliminar
   */
  static async actualizarResultadoPreliminar(id_encuesta) {
    try {
      const opciones = await db('opcion_encuesta')
        .select(
          'opcion_encuesta.*',
          db.raw('COUNT(voto_encuesta.id) as votos')
        )
        .leftJoin('voto_encuesta', 'opcion_encuesta.id_opcion', 'voto_encuesta.id_opcion')
        .where('opcion_encuesta.id_encuesta', id_encuesta)
        .groupBy('opcion_encuesta.id_opcion');

      const totalVotos = opciones.reduce((sum, opcion) => sum + parseInt(opcion.votos), 0);

      const resultadoPreliminar = opciones.reduce((acc, opcion) => {
        const votos = parseInt(opcion.votos);
        acc[opcion.id_opcion] = {
          texto: opcion.texto_opcion,
          votos,
          porcentaje: totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(2) : 0
        };
        return acc;
      }, {});

      await db('encuesta')
        .where('id_encuesta', id_encuesta)
        .update({
          resultado_preliminar: JSON.stringify(resultadoPreliminar)
        });

    } catch (error) {
      console.error('Error al actualizar resultado preliminar:', error);
    }
  }

  /**
   * Validaciones para votar
   */
  static validarVoto() {
    return [
      body('id_opcion')
        .notEmpty()
        .withMessage('El ID de la opción es requerido')
        .isInt({ min: 1 })
        .withMessage('El ID de la opción debe ser un número entero positivo')
    ];
  }
}

module.exports = VotosController;