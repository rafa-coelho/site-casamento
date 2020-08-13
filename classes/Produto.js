class Produto extends Classes
{
    static table = 'produto';
    static fields = [ 'id', 'nome', 'nome_normalizado', 'valor_minimo', 'valor_maximo', 'categoria' ];
}

module.exports = Produto;