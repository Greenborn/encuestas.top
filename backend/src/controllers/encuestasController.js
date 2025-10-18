const db = require('../database/connection');
const { body, validationResult } = require('express-validator');

class EncuestasController {
  
  /**
   * Crear nueva encuesta
   * POST /api/encuestas
   */
  static async crearEncuesta(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { titulo, descripcion, fecha_finalizacion, opciones } = req.body;
      const id_usuario = req.user.id;

      // Iniciar transacción
      const trx = await db.transaction();

      try {
        // Crear la encuesta
        const [id_encuesta] = await trx('encuesta').insert({
          titulo,
          descripcion,
          id_usuario,
          fecha_finalizacion: fecha_finalizacion ? new Date(fecha_finalizacion) : null,
          resultado_preliminar: JSON.stringify({})
        });

        // Crear las opciones si se proporcionaron
        if (opciones && opciones.length > 0) {
          const opcionesData = opciones.map(opcion => ({
            id_encuesta,
            texto_opcion: opcion.texto_opcion,
            color: opcion.color || '#007bff'
          }));
          
          await trx('opcion_encuesta').insert(opcionesData);
        }

        await trx.commit();

        // Obtener la encuesta completa con opciones
        const encuestaCompleta = await this.obtenerEncuestaCompleta(id_encuesta);

        res.status(201).json({
          success: true,
          message: 'Encuesta creada exitosamente',
          data: encuestaCompleta
        });

      } catch (error) {
        await trx.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error al crear encuesta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Listar encuestas públicas
   * GET /api/encuestas
   */
  static async listarEncuestas(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;
      const userId = req.user?.id;

      let query = db('encuesta')
        .select(
          'encuesta.*',
          'usuario.nombre as nombre_creador',
          db.raw('COUNT(voto_encuesta.id) as total_votos')
        )
        .leftJoin('usuario', 'encuesta.id_usuario', 'usuario.id_usuario')
        .leftJoin('voto_encuesta', 'encuesta.id_encuesta', 'voto_encuesta.id_encuesta')
        .groupBy('encuesta.id_encuesta');

      // Filtro de búsqueda
      if (search) {
        query = query.where(function() {
          this.where('encuesta.titulo', 'like', `%${search}%`)
              .orWhere('encuesta.descripcion', 'like', `%${search}%`);
        });
      }

      // Obtener total de registros
      const totalQuery = query.clone();
    const total = await totalQuery.count('* as count').first();
    // Asegurar que total.count existe y es número
    const totalCount = total && (typeof total.count === 'string' ? Number(total.count) : total.count) || 0;

      // Aplicar paginación
      const encuestas = await query
        .orderBy('encuesta.fecha_creacion', 'desc')
        .limit(limit)
        .offset(offset);

      // Para cada encuesta, verificar si el usuario puede votar
      const encuestasConEstado = await Promise.all(
        encuestas.map(async (encuesta) => {
          let puedeVotar = false;
          let yaVoto = false;

          if (userId) {
            const votoExistente = await db('voto_encuesta')
              .where({
                id_encuesta: encuesta.id_encuesta,
                id_usuario: userId
              })
              .first();

            yaVoto = !!votoExistente;
            puedeVotar = !yaVoto && (!encuesta.fecha_finalizacion || new Date(encuesta.fecha_finalizacion) > new Date());
          }

          return {
            ...encuesta,
            puede_votar: puedeVotar,
            ya_voto: yaVoto,
            es_propietario: userId === encuesta.id_usuario
          };
        })
      );

      res.json({
        success: true,
        data: {
          encuestas: encuestasConEstado,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error al listar encuestas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Obtener detalles de una encuesta
   * GET /api/encuestas/:id
   */
  static async obtenerEncuesta(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const encuesta = await this.obtenerEncuestaCompleta(id);

      if (!encuesta) {
        return res.status(404).json({
          success: false,
          message: 'Encuesta no encontrada',
          error: 'POLL_NOT_FOUND'
        });
      }

      // Verificar estado del usuario con respecto a esta encuesta
      let puedeVotar = false;
      let yaVoto = false;

      if (userId) {
        const votoExistente = await db('voto_encuesta')
          .where({
            id_encuesta: id,
            id_usuario: userId
          })
          .first();

        yaVoto = !!votoExistente;
        puedeVotar = !yaVoto && (!encuesta.fecha_finalizacion || new Date(encuesta.fecha_finalizacion) > new Date());
      }

      res.json({
        success: true,
        data: {
          ...encuesta,
          puede_votar: puedeVotar,
          ya_voto: yaVoto,
          es_propietario: userId === encuesta.id_usuario
        }
      });

    } catch (error) {
      console.error('Error al obtener encuesta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Eliminar encuesta (solo propietario)
   * DELETE /api/encuestas/:id
   */
  static async eliminarEncuesta(req, res) {
    try {
      const { id } = req.params;
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
          message: 'Encuesta no encontrada o no tienes permisos para eliminarla',
          error: 'POLL_NOT_FOUND_OR_UNAUTHORIZED'
        });
      }

      // Eliminar la encuesta (las opciones y votos se eliminan por CASCADE)
      await db('encuesta')
        .where('id_encuesta', id)
        .del();

      res.json({
        success: true,
        message: 'Encuesta eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar encuesta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Método auxiliar para obtener encuesta completa con opciones
   */
  static async obtenerEncuestaCompleta(id_encuesta) {
    const encuesta = await db('encuesta')
      .select(
        'encuesta.*',
        'usuario.nombre as nombre_creador',
        'usuario.email as email_creador'
      )
      .leftJoin('usuario', 'encuesta.id_usuario', 'usuario.id_usuario')
      .where('encuesta.id_encuesta', id_encuesta)
      .first();

    if (!encuesta) {
      return null;
    }

    // Obtener opciones con conteo de votos
    const opciones = await db('opcion_encuesta')
      .select(
        'opcion_encuesta.*',
        db.raw('COUNT(voto_encuesta.id) as votos')
      )
      .leftJoin('voto_encuesta', 'opcion_encuesta.id_opcion', 'voto_encuesta.id_opcion')
      .where('opcion_encuesta.id_encuesta', id_encuesta)
      .groupBy('opcion_encuesta.id_opcion')
      .orderBy('opcion_encuesta.id_opcion');

    // Calcular total de votos
    const totalVotos = opciones.reduce((sum, opcion) => sum + parseInt(opcion.votos), 0);

    // Actualizar resultado preliminar
    const resultadoPreliminar = opciones.reduce((acc, opcion) => {
      acc[opcion.id_opcion] = {
        texto: opcion.texto_opcion,
        votos: parseInt(opcion.votos),
        porcentaje: totalVotos > 0 ? ((parseInt(opcion.votos) / totalVotos) * 100).toFixed(2) : 0
      };
      return acc;
    }, {});

    // Actualizar en base de datos
    await db('encuesta')
      .where('id_encuesta', id_encuesta)
      .update({
        resultado_preliminar: JSON.stringify(resultadoPreliminar)
      });

    return {
      ...encuesta,
      opciones,
      total_votos: totalVotos,
      resultado_preliminar: resultadoPreliminar
    };
  }

  /**
   * Validaciones para crear encuesta
   */
  static validarCrearEncuesta() {
    return [
      body('titulo')
        .notEmpty()
        .withMessage('El título es requerido')
        .isLength({ min: 3, max: 255 })
        .withMessage('El título debe tener entre 3 y 255 caracteres'),
      
      body('descripcion')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede exceder 1000 caracteres'),
      
      body('fecha_finalizacion')
        .optional()
        .isISO8601()
        .withMessage('La fecha de finalización debe ser válida'),
      
      body('opciones')
        .optional()
        .isArray({ min: 2, max: 10 })
        .withMessage('Debe haber entre 2 y 10 opciones'),
      
      body('opciones.*.texto_opcion')
        .if(body('opciones').exists())
        .notEmpty()
        .withMessage('El texto de la opción es requerido')
        .isLength({ min: 1, max: 255 })
        .withMessage('El texto de la opción debe tener entre 1 y 255 caracteres'),
      
      body('opciones.*.color')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('El color debe ser un código hexadecimal válido')
    ];
  }
}

module.exports = EncuestasController;