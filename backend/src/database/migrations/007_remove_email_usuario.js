exports.up = function(knex) {
  return knex.schema.table('usuario', function(table) {
    table.dropColumn('email');
  });
};

exports.down = function(knex) {
  return knex.schema.table('usuario', function(table) {
    table.string('email', 255).notNullable().unique();
    table.index('email');
  });
};
