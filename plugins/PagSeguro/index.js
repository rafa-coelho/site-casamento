const axios = require("axios");

class PagSeguro {
    
    constructor(token, sandbox = false) {
        axios.defaults.baseURL = sandbox ? "https://sandbox.api.pagseguro.com/" : "https://api.pagseguro.com/";
        axios.defaults.headers.common['Authorization'] = token;
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.defaults.headers.post['x-api-version'] = '1.0';
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

        try {
            const response = (await axios.post("/charges", data)).data
            this.retorno = {
                id: response.id,
                status: response.status,
                created_at: response.created_at,
                paid_at: response.paid_at,
            };
        } catch (e) {
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