class Presente extends Classes
{
    static table = 'presente';
    static fields = [ 'id', 'convidado', 'produto', 'valor', 'forma_pagamento', 'recibo', 'status' ];
}

module.exports = Presente;