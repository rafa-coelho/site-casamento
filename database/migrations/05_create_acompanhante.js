exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('acompanhante').then(function (exists) {
        if (!exists)
            return database.schema.createTable("acompanhante", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('convidado', 45).notNullable();
                table.string('nome', 120).notNullable();
                table.bool('deleted').defaultTo(false);
            });
    });

}

exports.down = async function (database) {
    return database.schema.hasTable('acompanhante').then(function (exists) {
        if (exists)
            return database.schema.dropTable('acompanhante');
    });
}