const json = require('../data/products.json');
module.exports = (app) => {

    app.get(`/category`, (req, res) => {
        const categories = json.categorias.map(x => ({ 
            name: x.name,
            label: x.label,
            image: x.image
        }) );

        res.send(categories);
    });

    app.get(`/category/:ct`, (req, res) => {
        const { params } = req;

        const categories = json.categorias
            .filter(x => x.name === params.ct || x.label === params.ct )
            .map(x => ({ 
                name: x.name,
                label: x.label,
                image: x.image
            }));

        res.send(categories);
    });

};