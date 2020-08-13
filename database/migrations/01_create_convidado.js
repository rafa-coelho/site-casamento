exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('convidado').then(function (exists) {
        if (!exists)
            return database.schema.createTable("convidado", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('code', 10).notNullable();
                table.string('nome', 80).notNullable();
                table.string('email', 80);
                table.string('whatsapp', 15);
                table.int('quantidade').defaultTo(1);
                table.bool('confirmado', 25).defaultTo(false);
                table.bool('deleted').defaultTo(false);
            });
    });

}

exports.down = async function (database) {
    return database.schema.hasTable('convidado').then(function (exists) {
        if (exists)
            return database.schema.dropTable('convidado');
    });
}