const json = require('../data/products.json');

module.exports = (app) => {

    app.get(`/product/category/:cat`, (req, res) => {
        const { params } = req;
        
        const category = json.categorias.find(x => x.name === params.cat || x.label === params.cat);

        if(!category){
            return res.status(404).send("Categoria não encontrada!");
        }

        res.send(category.produtos);
    });

    app.get(`/product/:name`, (req, res) => {
        const { params } = req;

        const produto = json.categorias.reduce((a, b) => {
            if(!b.produtos)
                return a;

            return [ ...a, ...b.produtos ];
        }, []).find(x => x.name === params.name);

        if(!produto){
            return res.status(404).send("Produto não encontrado!");
        }

        res.send(produto);
    });

};