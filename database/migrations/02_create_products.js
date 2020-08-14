exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('produto').then(function (exists) {
        if (!exists)
            return database.schema.createTable("produto", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('nome', 120).notNullable();
                table.string('nome_normalizado', 120).notNullable();
                table.string('categoria', 45).notNullable();
                table.string('valor_minimo', 10);
                table.string('valor_maximo', 10);
                table.string('imagem', 100);
                table.bool('deleted').defaultTo(false);
            });
    });

}

exports.down = async function (database) {
    return database.schema.hasTable('produto').then(function (exists) {
        if (exists)
            return database.schema.dropTable('produto');
    });
}