const axios = require("axios");

class PagSeguro {

    constructor(token = PS_TOKEN, sandbox = process.env.NODE_ENV !== 'prod') {
        axios.defaults.baseURL = sandbox ? "https://sandbox.api.pagseguro.com/" : "https://api.pagseguro.com/";
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.defaults.headers.post['x-api-version'] = '4.0';
    }

    Cartao(cartao) {
        this.payment_type = "CREDIT_CARD";
        this.credit_card = {
            "number": cartao.numero,
            "exp_month": cartao.mes,
            "exp_year": cartao.ano,
            "security_code": cartao.cvv,
            "holder": {
                "name": cartao.nome
            }
        };
    }

    Boleto(user) {
        const date = new Date();
        date.setDate(date.getDate() + 10);
        this.payment_type = "BOLETO";
        this.boleto = {
            due_date: date.toISOString().slice(0, 10),
            holder: {
                name: user.nome,
                tax_id: user.cpf.replace(/\D/g, ''),
                email: user.email,
                address: {
                    street: user.endereco ? user.endereco.rua : 'Rua da Cançoneta',
                    number: user.endereco ? user.endereco.numero : '44',
                    locality: user.endereco ? user.endereco.bairro : 'Itaim Paulista',
                    city: user.endereco ? user.endereco.cidade : 'Sao Paulo',
                    region: user.endereco ? user.endereco.estado : 'Sao Paulo',
                    region_code: user.endereco ? user.endereco.uf : 'SP',
                    postal_code: user.endereco ? user.endereco.cep : '08141008',
                    country: "BR"
                }
            }
        };
    }

    Parcelas(parcelas) {
        this.parcelas = Number(parcelas);
    }

    Descricao(descricao) {
        this.descricao = descricao;
    }

    async Cobrar(valor) {
        const data = {
            "reference_id": "RA1234",
            "description": this.descricao || "",
            "amount": {
                "value": valor,
                "currency": "BRL"
            },
            "payment_method": {
                "type": this.payment_type || "CREDIT_CARD",
                "installments": this.parcelas || 1,
                "capture": true,
            }
        }

        this.valor = valor;

        if (this.payment_type === "CREDIT_CARD") {
            data.payment_method.card = this.credit_card;
        }

        if (this.payment_type === "BOLETO") {
            data.payment_method.boleto = this.boleto;
        }



        try {
            const response = (await axios.post("/charges", JSON.stringify(data))).data;
            this.retorno = {
                id: response.id,
                status: response.status,
                created_at: response.created_at,
                paid_at: response.paid_at
            };

            if (this.payment_type === "BOLETO") {
                this.retorno.boleto = {
                    id: response.payment_method.boleto.id,
                    barcode: response.payment_method.boleto.barcode,
                    formatted_barcode: response.payment_method.boleto.formatted_barcode,
                    link: response.links.find(x => x.media === 'image/png').href
                }
            }

        } catch (e) {
            console.log(JSON.stringify(e.response.data));
            this.retorno = e.response.data;
        } finally {
            return this.retorno;
        }
    }

    async Extorno(valor = null) {
        try {
            const response = (await axios.post(`/charges/${this.retorno.id}/cancel`, {
                amount: {
                    value: (valor) ? valor : this.valor
                }
            })).data;
        } catch (e) {
            this.retorno = e.response.data;
        } finally {
            return this.retorno;
        }
    }

    static async ValidarCartao(cartao) {
        const pag = new PagSeguro();
        pag.descricao = "R&A";
        pag.Cartao(cartao);

        const cobranca = await pag.Cobrar(1000);

        if (cobranca.status === "PAID") {
            pag.Extorno(1000);
            return true;
        } else {
            return false;
        }
    }

}

module.exports = PagSeguro;