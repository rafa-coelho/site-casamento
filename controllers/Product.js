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

        if (!produto) {
            return res.status(404).send("Produto não encontrado!");
        }

        res.send(produto);
    });

    app.post(`/product/:id`, async (req, res) => {
        const { headers, params, body } = req;
        const resp = {
            status: 0,
            msg: "",
            data: null,
            errors: []
        };

        if (!headers['authorization']) {
            return res.status(403).send("Informe o código");
        }

        const convidado = await Convidado.GetFirst(`code = '${headers['authorization']}'`);

        if (!convidado) {
            return res.status(403).send("Convidado não encontrado!");
        }

        const produto = await Produto.GetFirst(`id = '${params.id}'`);

        if (!produto) {
            return res.status(404).send("Produto não encontrado!");
        }

        const obrigatorios = ['valor', 'forma_pagamento'];

        obrigatorios.forEach(campo => {
            if (!body[campo]) {
                resp.errors.push({
                    msg: `O campo '${campo}' é obrigatório!`
                });
            }
        });

        if (body.forma_pagamento === "CREDIT_CARD") {
            if(!body.cartao){
                resp.errors.push({
                    msg: `O campo 'Cartão' é obrigatório!`
                });
            }else{
                ["numero", "cvv", "mes", "ano", "nome"].forEach(campo => {
                    if (!body.cartao[campo]) {
                        resp.errors.push({
                            msg: `O campo 'cartao.${campo}' é obrigatório!`
                        });
                    }
                });
            }

        }

        if (body.forma_pagamento === "BOLETO") {
            [ 'nome', 'cpf', 'email', 'endereco'].forEach(campo => {
                if (!body[campo]) {
                    resp.errors.push({
                        msg: `O campo 'boleto.${campo}' é obrigatório!`
                    });
                }
            });

            if(body.endereco){
                [ 'rua', 'numero', 'bairro', 'cidade', 'estado', 'uf', 'cep' ].forEach(campo => {
                    if (!body.endereco[campo]) {
                        resp.errors.push({
                            msg: `O campo 'endereco.${campo}' é obrigatório!`
                        });
                    }
                });
            }
        }

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        const pag = new PagSeguro();

        if(body.forma_pagamento === "CREDIT_CARD"){
            // Validar Cartão
            const cartao = {
                numero: body.cartao.numero.replace(/\D+/g, ""),
                mes: body.cartao.mes,
                ano: body.cartao.ano,
                cvv: body.cartao.cvv,
                nome: body.cartao.nome
            };
            pag.Cartao(cartao);
        }

        const valor_centavos = Number((parseFloat(body.valor.replace(',', '.')).toFixed(2)).toString().replace(/\./g, ""));
        // pag.Cobrar(valor_centavos);
        
        res.send(resp);
    });

};