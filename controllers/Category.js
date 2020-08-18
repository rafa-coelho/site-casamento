module.exports = (app) => {

    app.get(`/category`, async (req, res) => {
        const { headers } = req;
        const resp = {
            status: 0,
            data: null,
            errors: []
        };
        
        if (!headers['authorization']) {
            resp.errors.push({
                msg: "Informe o código do convidado"
            });
            return res.status(403).send(resp);
        }

        const convidado = await Convidado.GetFirst(`code = '${headers['authorization']}'`);

        if (!convidado) {
            resp.errors.push({
                msg: "Convidado não encontrado!"
            });
            return res.status(403).send(resp);
        }

        const categories = await Categoria.Get();

        resp.status = 1;
        resp.data = categories;

        res.send(resp);
    });

    app.get(`/category/:cat`, async (req, res) => {
        const { params } = req;
        const resp = {
            status: 0,
            data: null,
            errors: []
        };
        const category = await Categoria.GetFirst(`nome = '${params.cat}' OR nome_normalizado = '${params.cat}'`);

        if (!category) {
            resp.errors.push({
                msg: "Categoria não encontrada!"
            });
            return res.status(403).send(resp);
        }

        resp.status = 1;
        resp.data = category;
        res.send(resp);
    });

};