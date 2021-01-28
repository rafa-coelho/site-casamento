class Presente extends Classes
{
    static table = 'presente';
    static fields = [ 'id', 'convidado', 'produto', 'valor', 'forma_pagamento', 'barcode', 'recibo', 'status' ];
}

module.exports = Presente;