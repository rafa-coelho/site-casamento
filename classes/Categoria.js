class Categoria extends Classes
{
    static table = 'categoria';
    static fields = [ 'id', 'nome', 'nome_normalizado', 'imagem' ];
}

module.exports = Categoria;