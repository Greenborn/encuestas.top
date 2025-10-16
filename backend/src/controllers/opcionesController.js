const db = require('../database/connection');
const { body, validationResult } = require('express-validator');

class OpcionesController {

  /**
   * Agregar opción a encuesta (solo propietario)
   * POST /api/encuestas/:id/opciones
   */
  static async agregarOpcion(req, res) {
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
      const { texto_opcion, color = '#007bff' } = req.body;
      const userId = req.user.id;

      // Verificar que la encuesta existe y pertenece al usuario
      const encuesta = await db('encuesta')
        .where({
          id_encuesta: id,
          id_usuario: userId
        })
        .first();

      if (!encuesta) {
        return res.status(404).json({
          success: false,
          message: 'Encuesta no encontrada o no tienes permisos para modificarla',
          error: 'POLL_NOT_FOUND_OR_UNAUTHORIZED'
        });
      }

      // Verificar que la encuesta no haya finalizado
      if (encuesta.fecha_finalizacion && new Date(encuesta.fecha_finalizacion) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden agregar opciones a una encuesta finalizada',
          error: 'POLL_FINISHED'
        });
      }

      // Verificar límite de opciones (máximo 10)
      const opcionesExistentes = await db('opcion_encuesta')
        .where('id_encuesta', id)
        .count('* as count')
        .first();

      if (opcionesExistentes.count >= 10) {
        return res.status(400).json({
          success: false,
          message: 'Una encuesta no puede tener más de 10 opciones',
          error: 'MAX_OPTIONS_EXCEEDED'
        });
      }

      // Crear la nueva opción
      const [id_opcion] = await db('opcion_encuesta').insert({
        id_encuesta: id,
        texto_opcion,
        color
      });

      // Obtener la opción creada
      const nuevaOpcion = await db('opcion_encuesta')
        .where('id_opcion', id_opcion)
        .first();

      res.status(201).json({
        success: true,
        message: 'Opción agregada exitosamente',
        data: {
          ...nuevaOpcion,
          votos: 0
        }
      });

    } catch (error) {
      console.error('Error al agregar opción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Listar opciones de una encuesta
   * GET /api/encuestas/:id/opciones
   */
  static async listarOpciones(req, res) {
    try {
      const { id } = req.params;

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

      // Calcular porcentajes
      const totalVotos = opciones.reduce((sum, opcion) => sum + parseInt(opcion.votos), 0);
      
      const opcionesConPorcentaje = opciones.map(opcion => ({
        ...opcion,
        votos: parseInt(opcion.votos),
        porcentaje: totalVotos > 0 ? ((parseInt(opcion.votos) / totalVotos) * 100).toFixed(2) : 0
      }));

      res.json({
        success: true,
        data: {
          opciones: opcionesConPorcentaje,
          total_votos: totalVotos
        }
      });

    } catch (error) {
      console.error('Error al listar opciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Eliminar opción de encuesta (solo propietario)
   * DELETE /api/encuestas/:id/opciones/:opcionId
   */
  static async eliminarOpcion(req, res) {
    try {
      const { id, opcionId } = req.params;
      const userId = req.user.id;

      // Verificar que la encuesta existe y pertenece al usuario
      const encuesta = await db('encuesta')
        .where({
          id_encuesta: id,
          id_usuario: userId
        })
        .first();

      if (!encuesta) {
        return res.status(404).json({
          success: false,
          message: 'Encuesta no encontrada o no tienes permisos para modificarla',
          error: 'POLL_NOT_FOUND_OR_UNAUTHORIZED'
        });
      }

      // Verificar que la opción existe y pertenece a la encuesta
      const opcion = await db('opcion_encuesta')
        .where({
          id_opcion: opcionId,
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

      // Verificar que quedarán al menos 2 opciones después de eliminar
      const totalOpciones = await db('opcion_encuesta')
        .where('id_encuesta', id)
        .count('* as count')
        .first();

      if (totalOpciones.count <= 2) {
        return res.status(400).json({
          success: false,
          message: 'Una encuesta debe tener al menos 2 opciones',
          error: 'MIN_OPTIONS_REQUIRED'
        });
      }

      // Verificar que la encuesta no haya finalizado
      if (encuesta.fecha_finalizacion && new Date(encuesta.fecha_finalizacion) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden eliminar opciones de una encuesta finalizada',
          error: 'POLL_FINISHED'
        });
      }

      // Eliminar la opción (los votos se eliminan por CASCADE)
      await db('opcion_encuesta')
        .where('id_opcion', opcionId)
        .del();

      res.json({
        success: true,
        message: 'Opción eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar opción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Actualizar opción de encuesta (solo propietario)
   * PUT /api/encuestas/:id/opciones/:opcionId
   */
  static async actualizarOpcion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { id, opcionId } = req.params;
      const { texto_opcion, color } = req.body;
      const userId = req.user.id;

      // Verificar que la encuesta existe y pertenece al usuario
      const encuesta = await db('encuesta')
        .where({
          id_encuesta: id,
          id_usuario: userId
        })
        .first();

      if (!encuesta) {
        return res.status(404).json({
          success: false,
          message: 'Encuesta no encontrada o no tienes permisos para modificarla',
          error: 'POLL_NOT_FOUND_OR_UNAUTHORIZED'
        });
      }

      // Verificar que la opción existe y pertenece a la encuesta
      const opcion = await db('opcion_encuesta')
        .where({
          id_opcion: opcionId,
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

      // Verificar que la encuesta no haya finalizado
      if (encuesta.fecha_finalizacion && new Date(encuesta.fecha_finalizacion) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden modificar opciones de una encuesta finalizada',
          error: 'POLL_FINISHED'
        });
      }

      // Actualizar la opción
      const datosActualizacion = {};
      if (texto_opcion !== undefined) datosActualizacion.texto_opcion = texto_opcion;
      if (color !== undefined) datosActualizacion.color = color;

      await db('opcion_encuesta')
        .where('id_opcion', opcionId)
        .update(datosActualizacion);

      // Obtener la opción actualizada con conteo de votos
      const opcionActualizada = await db('opcion_encuesta')
        .select(
          'opcion_encuesta.*',
          db.raw('COUNT(voto_encuesta.id) as votos')
        )
        .leftJoin('voto_encuesta', 'opcion_encuesta.id_opcion', 'voto_encuesta.id_opcion')
        .where('opcion_encuesta.id_opcion', opcionId)
        .groupBy('opcion_encuesta.id_opcion')
        .first();

      res.json({
        success: true,
        message: 'Opción actualizada exitosamente',
        data: {
          ...opcionActualizada,
          votos: parseInt(opcionActualizada.votos)
        }
      });

    } catch (error) {
      console.error('Error al actualizar opción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Validaciones para agregar/actualizar opción
   */
  static validarOpcion() {
    return [
      body('texto_opcion')
        .notEmpty()
        .withMessage('El texto de la opción es requerido')
        .isLength({ min: 1, max: 255 })
        .withMessage('El texto de la opción debe tener entre 1 y 255 caracteres'),
      
      body('color')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('El color debe ser un código hexadecimal válido')
    ];
  }

  /**
   * Validaciones para actualizar opción (campos opcionales)
   */
  static validarActualizarOpcion() {
    return [
      body('texto_opcion')
        .optional()
        .notEmpty()
        .withMessage('El texto de la opción no puede estar vacío')
        .isLength({ min: 1, max: 255 })
        .withMessage('El texto de la opción debe tener entre 1 y 255 caracteres'),
      
      body('color')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('El color debe ser un código hexadecimal válido')
    ];
  }
}

module.exports = OpcionesController;