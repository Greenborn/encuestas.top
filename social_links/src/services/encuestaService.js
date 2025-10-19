import knex from '../db/knex.js';

export async function getEncuestaById(id_encuesta) {
  const encuesta = await knex('encuesta')
    .where({ id_encuesta })
    .first();
  return encuesta;
}
