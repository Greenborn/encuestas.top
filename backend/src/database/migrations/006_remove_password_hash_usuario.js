exports.up = function(knex) {
  return knex.schema.alterTable('usuario', function(table) {
    table.dropColumn('password_hash');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('usuario', function(table) {
    table.string('password_hash', 255).notNullable();
  });
};
