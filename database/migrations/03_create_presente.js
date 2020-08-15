exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('presente').then(function (exists) {
        if (!exists)
            return database.schema.createTable("presente", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('convidado', 45).notNullable();
                table.string('produto', 45).notNullable();
                table.string('valor', 10).notNullable();
                table.string('forma_pagamento', 10);
                table.string('recibo', 50);
                table.string('status', 10);
                table.bool('deleted').defaultTo(false);
            });
    });

}

exports.down = async function (database) {
    return database.schema.hasTable('presente').then(function (exists) {
        if (exists)
            return database.schema.dropTable('presente');
    });
}