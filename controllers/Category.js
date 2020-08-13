const json = require('../data/products.json');
module.exports = (app) => {

    app.get(`/category`, (req, res) => {
        const categories = json.categorias.map(x => ({
            name: x.name,
            label: x.label,
            image: x.image
        }));

        res.send(categories);
    });

    app.get(`/category/:cat`, (req, res) => {
        const { params } = req;

        const category = json.categorias
            .find(x => x.name === params.cat || x.label === params.cat)
            .map(x => ({
                name: x.name,
                label: x.label,
                image: x.image
            }));

        if (!category) {
            return res.status(404).send("Categoria não encontrada!");
        }

        res.send(category);
    });

};