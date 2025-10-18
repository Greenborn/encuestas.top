exports.up = function(knex) {
  return knex.schema.alterTable('usuario', function(table) {
    table.timestamp('creado_el').notNullable().defaultTo(knex.fn.now());
    table.timestamp('actualizado_el').notNullable().defaultTo(knex.fn.now());
    table.string('apodo', 255).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('usuario', function(table) {
    table.dropColumn('creado_el');
    table.dropColumn('actualizado_el');
    table.dropColumn('apodo');
  });
};
