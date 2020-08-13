exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('cartao_credito').then(function (exists) {
        if (!exists)
            return database.schema.createTable("cartao_credito", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('convidado', 45).notNullable();
                table.string('nome', 120).notNullable();
                table.string('numero', 45).notNullable();
                table.string('mes', 4);
                table.string('ano', 4);
                table.string('cvv', 3);
                table.bool('deleted').defaultTo(false);
            });
    });

}

exports.down = async function (database) {
    return database.schema.hasTable('cartao_credito').then(function (exists) {
        if (exists)
            return database.schema.dropTable('cartao_credito');
    });
}