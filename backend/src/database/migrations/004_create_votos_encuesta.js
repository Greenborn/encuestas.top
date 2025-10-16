exports.up = function(knex) {
  return knex.schema.createTable('voto_encuesta', function(table) {
    table.increments('id').primary();
    table.integer('id_opcion').unsigned().notNullable();
    table.integer('id_encuesta').unsigned().notNullable();
    table.integer('id_usuario').unsigned().notNullable();
    table.datetime('fecha_creacion').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('id_opcion').references('id_opcion').inTable('opcion_encuesta').onDelete('CASCADE');
    table.foreign('id_encuesta').references('id_encuesta').inTable('encuesta').onDelete('CASCADE');
    table.foreign('id_usuario').references('id_usuario').inTable('usuario').onDelete('CASCADE');
    
    // Índices
    table.index('id_encuesta');
    table.index('id_usuario');
    table.index('id_opcion');
    
    // Constraint único: un usuario solo puede votar una vez por encuesta
    table.unique(['id_encuesta', 'id_usuario']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('voto_encuesta');
};