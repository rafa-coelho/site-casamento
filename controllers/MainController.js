module.exports = (app) => {

    // Home
    app.get(`/`, (req, res) => {
        res.sendFile(ROOT + '/pages/index.html');
    });
    
    // Produtos
    app.get(`/lista-presentes`, (req, res) => {
        res.sendFile(ROOT + '/pages/Produtos.html');
    });
    
    // Comprar Produto
    app.get(`/produto`, (req, res) => {
        res.sendFile(ROOT + '/pages/ComprarProduto.html');
    });

};