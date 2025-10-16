exports.up = function(knex) {
  return knex.schema.createTable('opcion_encuesta', function(table) {
    table.increments('id_opcion').primary();
    table.integer('id_encuesta').unsigned().notNullable();
    table.string('texto_opcion', 255).notNullable();
    table.string('color', 7).notNullable(); // Para códigos hexadecimales #FFFFFF
    
    // Foreign key
    table.foreign('id_encuesta').references('id_encuesta').inTable('encuesta').onDelete('CASCADE');
    
    // Índices
    table.index('id_encuesta');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('opcion_encuesta');
};