module.exports = (app) => {
    
    app.put(`/guest`, async (req, res) => {
        const { headers, body } = req;
        const resp = {
            status: 0,
            msg: "",
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

        const permitidos = [ 'nome', 'email', 'whatsapp', 'quantidade', 'quantidade_confirmado', 'confirmado', 'acompanantes' ];

        let hasEdit = false;
        const data = {};
        permitidos.forEach(campo => {
            if(body[campo]){
                hasEdit = true;
                data[campo] = body[campo];
            }
        });

        if(!hasEdit){
            resp.msg = "Nada para editar";
            return res.send(resp);
        }

        const update = await Convidado.Update(data, `id = '${convidado.id}'`);

        if(update.status !== 1){
            resp.errors.push({
                msg: "Erro ao atualizar convidado"
            });
            return res.status(500).send(resp);
        }

        if(body.acompanhantes){
            Acompanhante.Delete(`convidado = '${convidado.id}'`)
            body.acompanhantes.forEach(acompanhante => {
                Acompanhante.Create({
                    id: Hash.generateId(),
                    convidado: convidado.id,
                    nome: acompanhante
                });
            })
        }

        resp.status = 1;
        resp.msg = "Convidado atualizado com sucesso!";
        resp.data = {
            ...convidado,
            ...data
        };
        res.send(resp);
    });

    app.get(`/guest`, async (req, res) => {
        const { headers, body } = req;
        const resp = {
            status: 0,
            msg: "",
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

        resp.status = 1;
        resp.data = convidado;
        res.send(resp);
    });

    app.get(`/guest/:code`, async (req, res) => {
        const { headers, params } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        const convidado = await Convidado.GetFirst(`code = '${params.code}'`);

        if (!convidado) {
            resp.errors.push({
                msg: "Convidado não encontrado!"
            });
            return res.status(404).send(resp);
        }

        resp.status = 1;
        resp.data = convidado;
        res.send(resp);
    });

};