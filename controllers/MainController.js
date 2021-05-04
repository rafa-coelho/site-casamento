module.exports = (app) => {

    // Home
    app.get(`/`, (req, res) => {
        res.sendFile(ROOT + '/pages/index.html');
    });

    // Login
    app.get(`/login`, (req, res) => {
        res.sendFile(ROOT + '/pages/Login.html');
    });

    // Produtos
    app.get(`/lista-presentes`, (req, res) => {
        res.sendFile(ROOT + '/pages/Produtos.html');
    });

    // Comprar Produto
    app.get(`/produto`, (req, res) => {
        res.sendFile(ROOT + '/pages/ComprarProduto.html');
    });

    // Confirmacao de Compra 
    app.get(`/compra-confirmada`, (req, res) => {
        res.sendFile(ROOT + '/pages/CompraConfirmada.html');
    });

    // Link
    app.get(`/link`, (req, res) => {
        res.sendFile(ROOT + '/pages/Link.html');
    });

};