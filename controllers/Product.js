module.exports = (app) => {

    app.get(`/product/category/:cat`, async (req, res) => {
        const { params } = req;
        
        const category = await Categoria.GetFirst(`name = '${params.cat}' OR nome_normalizado = '${params.cat}'`);

        if (!category) {
            return res.status(404).send("Categoria não encontrada!");
        }

        const products = await Produto.Get(`categoria = '${category.id}'`);

        res.send(products || []);
    });

    app.get(`/product/:name`, async (req, res) => {
        const { params } = req;
        const produto = await Produto.Get(`nome = '${params.name}'`);
        res.send(produto);
    });

};