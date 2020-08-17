module.exports = (app) => {

    app.get(`/category`, async (req, res) => {
        const categories = await Categoria.Get();
        res.send(categories);
    });

    app.get(`/category/:cat`, async (req, res) => {
        const { params } = req;

        const category = await Categoria.GetFirst(`nome = '${params.cat}' OR nome_normalizado = '${params.cat}'`);

        if (!category) {
            return res.status(404).send("Categoria não encontrada!");
        }

        res.send(category);
    });

};