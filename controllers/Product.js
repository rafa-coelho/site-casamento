const PagSeguro = require('../plugins/PagSeguro');
const Twilio = require('../plugins/Twilio');

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

    app.get(`/product/category/:cat`, async (req, res) => {
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

    app.get(`/product/:name`, async (req, res) => {
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

    app.post(`/product/:id`, async (req, res) => {
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
            if(!body.parcelas){
                resp.errors.push({
                    msg: `O campo 'parcelas' é obrigatório!`
                });
            }

            if(!body.cartao){
                resp.errors.push({
                    msg: `O campo 'cartao' é obrigatório!`
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
            [ 'nome', 'cpf', 'email' ].forEach(campo => {
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

        let valor = parseFloat(body.valor.toString().replace(',', '.')).toFixed(2);
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
            valor = calcularValorTotal(valor, Number(body.parcelas))
            
            pag.Parcelas(Number(body.parcelas));
            pag.Cartao(cartao);
        }

        if(body.forma_pagamento === "BOLETO"){
            const user = {
                nome: body.nome,
                cpf: body.cpf,
                email: body.email,
                endereco: body.endereco
            };
            pag.Boleto(user);
        }
        
        const valor_centavos = valor.toString().replace(/\./g, "");
        const pagamento = await pag.Cobrar(valor_centavos);
        
        
        if(![ "WAITING", "PAID" ].includes(pagamento.status)){
            resp.errors.push({
                msg: "Erro ao realizar cobrança"
            });
            return res.status(500).send(resp);
        }
        
        const presente = {
            id: Hash.generateId(),
            convidado: convidado.id,
            produto: produto.id,
            valor: parseFloat(body.valor.toString().replace(',', '.')).toFixed(2),
            forma_pagamento: body.forma_pagamento,
            recibo: pagamento.id,
            barcode: pagamento.boleto ? pagamento.boleto.barcode : '',
            status: pagamento.status
        };
        
        const createPresente = await Presente.Create(presente);

        if(createPresente.status !== 1){
            pag.Extorno();
            resp.errors.push({
                msg: "Erro ao guardar pagamento"
            });
            return res.status(500).send(resp);
        }

        
        if(body.forma_pagamento === "BOLETO"){
            const mail = new Mailer();
            mail.to = body.email;
            mail.subject = "R&A - Obrigado pelo presente - BOLETO";
            mail.message = Mailer.Boleto(convidado, req.protocol + '://' + req.get('host') + `/compra-confirmada?id=${presente.id}`);
            await mail.Send();
        }
        
        // Twilio(`Oi, ${convidado.nome.split(' ')[0]}!\nRecebemos o seu presente!\n\nMuito obrigado ♥`, (convidado.whatsapp || "11976092174").replace(/\D+/g, ''));

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