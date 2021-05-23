var axios = require('axios');
module.exports = (app) => {

    app.get(`/pagamento/sessao`, async(req, res) => {
        const { headers } = req;
        const resp = {
            status: 0,
            data: null,
            errors: []
        };

        var urlPG = process.env.NODE_ENV == 'prod' ? 'https://ws.pagseguro.uol.com.br/v2/sessions' : 'https://ws.sandbox.pagseguro.uol.com.br/v2/sessions';
        console.log(`${urlPG}?email=${process.env.PS_EMAIL}&token=${process.env.NODE_ENV === 'prod' ? process.env.PS_TOKEN : process.env.PS_TOKEN_SB}`);
        const request = await axios.post(`${urlPG}?email=${process.env.PS_EMAIL}&token=${process.env.NODE_ENV === 'prod' ? process.env.PS_TOKEN : process.env.PS_TOKEN_SB}`);

        var response = await Hash.xml2json(request.data);
        const id = response.session.id[0];

        resp.status = 1;
        resp.data = id;
        res.send(resp);
    });

};