class CartaoCredito extends Classes
{
    static table = 'cartao_credito';
    static fields = [ 'id', 'convidado', 'nome', 'numero', 'ano', 'mes', 'cvv' ];
}
module.exports = CartaoCredito;