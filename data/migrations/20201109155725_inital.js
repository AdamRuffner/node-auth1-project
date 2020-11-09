exports.up = async function (knex) {
  await knex.schema.createTable("roles", (tbl) => {
    tbl.increments();
    tbl.string("name", 128).notNull().unique();
  });

  await knex.schema.createTable("users", (tbl) => {
    tbl.increments();
    tbl.string("username", 128).notNull().unique().index();
    tbl.string("password", 256).notNull();

    tbl
      .integer("role")
      .unsigned()
      .references("roles.id")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
  });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("roles");
    await knex.schema.dropTableIfExists("users");
};
