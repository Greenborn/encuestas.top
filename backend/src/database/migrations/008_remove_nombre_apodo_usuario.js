exports.up = function(knex) {
  return knex.schema.alterTable('usuario', function(table) {
    table.dropColumn('nombre');
    table.dropColumn('apodo');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('usuario', function(table) {
    table.string('nombre', 255).notNullable();
    table.string('apodo', 255).nullable();
  });
};
