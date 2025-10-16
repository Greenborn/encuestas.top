exports.up = function(knex) {
  return knex.schema.createTable('encuesta', function(table) {
    table.increments('id_encuesta').primary();
    table.string('titulo', 255).notNullable();
    table.text('descripcion');
    table.datetime('fecha_creacion').defaultTo(knex.fn.now());
    table.integer('id_usuario').unsigned().notNullable();
    table.datetime('fecha_finalizacion');
    table.json('resultado_preliminar');
    
    // Foreign key
    table.foreign('id_usuario').references('id_usuario').inTable('usuario').onDelete('CASCADE');
    
    // Índices
    table.index('id_usuario');
    table.index('fecha_creacion');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('encuesta');
};