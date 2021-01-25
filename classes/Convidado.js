class Convidado extends Classes
{
    static table = 'convidado';
    static fields = [ 'id', 'code', 'nome', 'email', 'whatsapp', 'quantidade', 'quantidade_confirmado', 'padrinho', 'confirmado' ];
}

module.exports = Convidado;