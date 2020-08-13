class Convidado extends Classes
{
    static table = 'convidado';
    static fields = [ 'id', 'code', 'nome', 'email', 'whatsapp', 'quantidade', 'confirmado' ];
}

module.export = Convidado;