// const PagSeguro = require('../plugins/PagSeguro');
var PagSeguro = require('node-pagseguro');

const calcularValorTotal = (valor, parcelas) => {
    const fator = [
        { parcelas: 1, fator: 1 },
        { parcelas: 2, fator: 0.51495 },
        { parcelas: 3, fator: 0.34670 },
        { parcelas: 4, fator: 0.26255 },
        { parcelas: 5, fator: 0.21210 },
        { parcelas: 6, fator: 0.17847 },
        { parcelas: 7, fator: 0.15446 },
        { parcelas: 8, fator: 0.13645 },
        { parcelas: 9, fator: 0.12246 },
        { parcelas: 10, fator: 0.11127 },
        { parcelas: 11, fator: 0.10212 },
        { parcelas: 12, fator: 0.09450 }
    ];

    return (valor * fator.find(x => x.parcelas === parcelas).fator) * parcelas;
};

module.exports = (app) => {

    app.get(`/product/category/:cat`, async(req, res) => {
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

        const products = await Produto.Get(`categoria = '${category.id}'`);

        resp.status = 1;
        resp.data = products;
        res.send(resp);
    });

    app.get(`/product/:name`, async(req, res) => {
        const { params } = req;

        const resp = {
            status: 0,
            data: null,
            errors: []
        };

        const produto = await Produto.GetFirst(`nome_normalizado = '${params.name}'`);

        if (!produto) {
            resp.errors.push({
                msg: "Produto não encontrado!"
            });
            return res.status(404).send(resp);
        }

        resp.status = 1;
        resp.data = produto;
        res.send(resp);
    });

    app.post(`/product/:id`, async(req, res) => {
        const { headers, params, body } = req;
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
            if (!body.parcelas) {
                resp.errors.push({
                    msg: `O campo 'parcelas' é obrigatório!`
                });
            }

            if (!body.cartao) {
                resp.errors.push({
                    msg: `O campo 'cartao' é obrigatório!`
                });
            } else {
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
            ['nome', 'cpf', 'email'].forEach(campo => {
                if (!body[campo]) {
                    resp.errors.push({
                        msg: `O campo 'boleto.${campo}' é obrigatório!`
                    });
                }
            });
        }

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }

        let valor = parseFloat(body.valor.toString().replace(',', '.'));

        var payment = new PagSeguro({
            email: process.env.PS_EMAIL,
            token: process.env.NODE_ENV === 'prod' ? process.env.PS_TOKEN : process.env.PS_TOKEN_SB,
            sandbox: process.env.NODE_ENV !== 'prod',
            sandbox_email: '123123123123123@sandbox.pagseguro.com.br'
        });

        payment.setShipping({
            street: body.endereco ? body.endereco.street : 'Rua da Cançoneta',
            number: body.endereco ? body.endereco.number : '44',
            district: body.endereco ? body.endereco.district : 'Itaim Paulista',
            city: body.endereco ? body.endereco.city : 'São Paulo',
            state: body.endereco ? body.endereco.state : 'SP',
            postal_code: body.endereco ? body.endereco.postal_code : '08141008',
            same_for_billing: true
        });

        payment.setSender({
            name: body.nome,
            email: body.email,
            cpf_cnpj: "44957569827",
            area_code: "11",
            phone: "976092174"
        });

        if (body.forma_pagamento === "CREDIT_CARD") {
            payment.setCreditCardHolder({
                name: body.cartao.nome,
                cpf_cnpj: body.cpf || "44957569827",
                area_code: "11",
                phone: "976092174",
                birth_date: body.nascimento
            });
        }

        payment.addItem({
            description: 'Presente',
            value: valor,
            qtde: 1
        });

        const sendTransaction = () => new Promise((resolve) => {
            const data = {
                method: body.forma_pagamento === "CREDIT_CARD" ? "creditCard" : "boleto", //'boleto' ou 'creditCard'
                value: valor,
                installments: Number(body.parcelas) || 1, //opcional, padrão 1
                hash: body.sender_hash,
            };

            if (body.forma_pagamento === "CREDIT_CARD") {
                data.credit_card_token = body.card_token;
            }

            payment.sendTransaction(data, function(err, data) {
                if (err) {
                    resolve(Array.isArray(err) ? err[0] : err);
                } else {
                    resolve(data);
                }
            });

        });

        const pagamento = await sendTransaction();

        if (pagamento.status !== '1') {

            let message = "Erro ao realizar cobrança";

            message = pagamento.message.indexOf('sender name invalid value') >= 0 ? 'O seu nome está correto?' : message;
            message = pagamento.message.indexOf('credit card holder cpf') >= 0 ? 'O seu CPF está correto?' : message;

            resp.errors.push({
                msg: message
            });
            return res.status(500).send(resp);
        }

        const presente = {
            id: Hash.generateId(),
            convidado: convidado.id,
            produto: produto.id,
            valor: parseFloat(body.valor.toString().replace(',', '.')).toFixed(2),
            forma_pagamento: body.forma_pagamento,
            recibo: pagamento.code,
            barcode: pagamento.paymentLink,
            status: pagamento.status
        };

        const createPresente = await Presente.Create(presente);

        if (createPresente.status !== 1) {
            pag.Extorno();
            resp.errors.push({
                msg: "Erro ao guardar pagamento"
            });
            return res.status(500).send(resp);
        }


        if (body.forma_pagamento === "BOLETO") {
            const mail = new Mailer();
            mail.to = body.email;
            mail.subject = "R&A - Obrigado pelo presente - BOLETO";
            mail.message = Mailer.Boleto(convidado, req.protocol + '://' + req.get('host') + `/compra-confirmada?id=${presente.id}`);
            await mail.Send();
        }


        resp.status = 1;
        resp.msg = "Item comprado com sucesso!";
        resp.data = {
            ...pagamento,
            ...presente,
            id: presente.id
        };
        res.send(resp);
    });

};