module.exports = (app) => {

    app.get(`/gift`, async (req, res) => {
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

        const presentes = await Presente.Get(`convidado = '${convidado.id}'`);

        resp.status = 1;
        resp.data = presentes;
        res.send(resp);
    });

    app.get(`/gift/:id`, async (req, res) => {
        const { headers, params } = req;
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

        const presente = await Presente.GetFirst(`convidado = '${convidado.id}' AND id = '${params.id}'`);

        if(!presente){
            res.errors.push({
                msg: "Presente não encontrado"
            });
            return res.status(404).send(resp);
        }

        resp.status = 1;
        resp.data = presente;
        res.send(resp);
    });

    app.post(`/gift/:id/second`, async (req, res) => {
        const { headers, params } = req;
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

        const presente = await Presente.GetFirst(`convidado = '${convidado.id}' AND id = '${params.id}'`);

        if(!presente){
            res.errors.push({
                msg: "Presente não encontrado"
            });
            return res.status(404).send(resp);
        }

        if(presente.forma_pagamento !== "BOLETO"){
            resp.errors.push({
                msg: "Só é possível pedir segunda via de pagamentos realizados no boleto"
            });
            return res.status(400).send(resp);
        }

        const pag = new PagSeguro();

        res.send(resp);
    });

};