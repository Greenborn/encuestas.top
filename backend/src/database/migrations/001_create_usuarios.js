exports.up = function(knex) {
  return knex.schema.createTable('usuario', function(table) {
    table.increments('id_usuario').primary();
    table.string('nombre', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.datetime('fecha_registro').defaultTo(knex.fn.now());
    
    // Índices
    table.index('email');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usuario');
};