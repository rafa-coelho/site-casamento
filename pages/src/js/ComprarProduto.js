const getSessionId = () => {
    return new Promise((resolve) => {
        $.ajax({
            url: `/pagamento/sessao`,
            complete: (request) => {
                const response = request.responseJSON;

                if (response.status == 1) {
                    resolve(response.data);
                    PagSeguroDirectPayment.setSessionId(response.data);
                } else {
                    resolve(null);
                }
            }
        });
    });
};

const getSenderHash = async() => {
    return new Promise((resolve, reject) => {
        PagSeguroDirectPayment.onSenderHashReady(function(response) {
            if (response.status == 'error') {
                reject(response.message);
                return false;
            }

            resolve(response.senderHash); //Hash estará disponível nesta variável.
        });
    });
};

const getCardBrand = async(card) => {
    return new Promise((resolve, reject) => {
        PagSeguroDirectPayment.getBrand({
            cardBin: card.toString().substr(0, 6),
            complete: function(response) {
                //tratamento comum para todas chamadas
                if (response.error) {
                    resolve(null);
                } else {
                    resolve(response.name);
                }
            }
        });
    });
};

// Non-used
const getInstallments = async(value, maxInstallmentNoInterest, brandName) => {
    return new Promise((resolve, reject) => {
        PagSeguroDirectPayment.getInstallments({
            amount: value,
            maxInstallmentNoInterest: maxInstallmentNoInterest,
            brand: brandName,
            complete: function(response) {
                // Callback para todas chamadas.
                console.log(response);
            }
        });
    });
};

const createCardToken = async(cardNumber, brand, cvv, expirationMonth, expirationYear) => {
    return new Promise((resolve, reject) => {
        PagSeguroDirectPayment.createCardToken({
            cardNumber, // Número do cartão de crédito
            brand, // Bandeira do cartão
            cvv, // CVV do cartão
            expirationMonth, // Mês da expiração do cartão
            expirationYear, // Ano da expiração do cartão, é necessário os 4 dígitos.
            complete: function(response) {
                // Callback para todas chamadas.
                if (response.card) {
                    resolve(response.card.token);
                } else {
                    resolve(null);
                }
            }
        });
    });
};

const setPagSeguroRequest = async(card = null) => {
    const response = {
        sessionId: await getSessionId(),
        senderHash: await getSenderHash()
    };

    if (card !== null) {
        const cardBrand = await getCardBrand(card.numero);
        response.cardToken = await createCardToken(card.numero, cardBrand, card.cvv, card.mes, card.ano);

        if (cardBrand === null || response.cardToken === null) {
            return "CARTAO_INVALIDO";
        }
    }
    return response;
};

Number.prototype.between = function(menor, maior) {
    return this >= menor && this <= maior;
}

const calcularParcelas = (valor) => {
    if (isNaN(valor) === true)
        return null;

    valor = parseFloat(valor);

    let maximoParcelas = 1;

    if (valor > 50) {
        maximoParcelas = 4;
    }

    if (valor >= 100) {
        maximoParcelas = 6;
    }

    if (valor >= 500) {
        maximoParcelas = 12;
    }


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

    const parcelas = [];

    for (let i = 1; i <= maximoParcelas; i++) {
        const valor_parcela = (valor * fator.find(x => x.parcelas === i).fator).toFixed(2);
        const valor_total = valor_parcela * i;
        const juros = ((valor_total - valor) / valor) * 100;
        //${juros > 0 ? ` (${juros.toFixed(2)}%)` : '' }

        parcelas.push({
            parcelas: i,
            valor_parcela,
            valor_total,
            juros,
            label: `${i}x de R$ ${valor_parcela.toString().replace('.', ',')}`,
            html: `<option value="${i}" valor_parcela="${valor_parcela}">${i}x de R$ ${valor_parcela.toString().replace('.', ',')}</option>`
        });
    }

    const options = `<option value="" selected disabled> -- Selecione -- </option> ${parcelas.map(x => x.html).join("")}`;

    $("#parcelas").html(options);
};

$(".change-forma-pagamento").on("click", (e) => {
    $(".change-forma-pagamento").removeClass("active");
    $(e.target).addClass("active");
});

$("body").on("submit", "#comprarBoleto", async(e) => {
    e.preventDefault();

    $(".btnConfirmar").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);

    const produto = $("#produto").val();
    const nome = window.GUEST ? window.GUEST.nome : $("#nome").val();
    const email = $(e.target).find("#email").val();
    const cpf = $(e.target).find("#cpf").val().replace(/\D/g, '');
    const valor = $("#valor").val();



    var pagSeguroData = await setPagSeguroRequest();


    $.ajax({
        url: `/product/${produto}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: window.GUEST ? window.GUEST.code : "ABCDEF"
        },
        data: JSON.stringify({
            nome,
            email,
            cpf,
            valor,
            forma_pagamento: "BOLETO",
            sender_hash: pagSeguroData.senderHash,
            pagseguro_sid: pagSeguroData.sessionId
        }),
        complete: (request) => {
            $(".btnConfirmar").html("Confirmar");

            const response = request.responseJSON;

            if (response.status == 1) {
                document.location = `/compra-confirmada?id=${response.data.id}`
            } else {
                notificacao("Ops!", response.errors[0].msg);
            }
        }
    });




});

$("body").on("submit", "#comprarCartao", async(e) => {
    e.preventDefault();

    $(".btnConfirmar").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);

    const produto = $("#produto").val();
    const valor = $("#valor").val();
    const parcelas = $("#parcelas").val();
    const email = $("#emailCartao").val();
    const nascimento = $("#dataNascimento").val();
    const nome = window.GUEST ? window.GUEST.nome : $("#nomeCartao").val();
    const cpf = $(e.target).find("#cpfCartao").val().replace(/\D/g, '');

    const cartao = {
        nome: $(e.target).find("#cc-nome").val(),
        numero: $(e.target).find("#cc-numero").val().replace(/\D/g, ''),
        cvv: $(e.target).find("#cc-cvv").val(),
        mes: $(e.target).find("#cc-expiracao").val().split("/")[0],
        ano: '20' + $(e.target).find("#cc-expiracao").val().split("/")[1],
    };

    var pagSeguroData = await setPagSeguroRequest(cartao);

    if (pagSeguroData === "CARTAO_INVALIDO") {
        notificacao("Ops!", "Parece que o seu cartão está inválido... Dá uma olhadinha aí!");
        $(".btnConfirmar").html("Confirmar");
        return;
    }


    $.ajax({
        url: `/product/${produto}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: window.GUEST ? window.GUEST.code : "ABCDEF"
        },
        data: JSON.stringify({
            nome,
            cpf,
            cartao,
            valor,
            email,
            nascimento,
            forma_pagamento: "CREDIT_CARD",
            parcelas,
            sender_hash: pagSeguroData.senderHash,
            pagseguro_sid: pagSeguroData.sessionId,
            card_token: pagSeguroData.cardToken
        }),
        complete: (request) => {
            $(".btnConfirmar").html("Confirmar");

            const response = request.responseJSON;

            if (response.status == 1) {
                notificacao("Obrigado!", "Obrigado pelo seu pesente! ♥");
                setTimeout(() => document.location = `/`, 1500);
            } else {
                notificacao("Ops!", response.errors[0].msg);
            }
        }
    });
});

$(async() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const nome_normalizado = urlParams.get('nome');

    $.ajax({
        url: `/product/${nome_normalizado}`,
        headers: {
            "Content-Type": "application/json"
        },
        complete: (request) => {
            const response = request.responseJSON;

            if (response.status == 1) {
                $("#imagem").attr("src", `/media/${response.data.imagem}`)
                $("#tituloProduto").text(response.data.nome);
                $("#valorProduto").text("R$ " + response.data.valor_minimo.replace('.', ','));
                $("#valor").val(response.data.valor_minimo);
                $("#produto").val(response.data.id);
                calcularParcelas(response.data.valor_minimo);
            }
        }
    });

    const cpfMask = ['999.999.999-99'];
    const cpf = document.querySelector('#cpf');
    VMasker(cpf).maskPattern(cpfMask[0]);
    // cpf.addEventListener('input', inputHandler.bind(undefined, cpfMask, 14), false);

    const cpfCartao = document.querySelector('#cpfCartao');
    VMasker(cpfCartao).maskPattern(cpfMask[0]);
    // cpf.addEventListener('input', inputHandler.bind(undefined, cpfMask, 14), false);

    const cardMask = ['9999.9999.9999.9999'];
    const card = document.querySelector('#cc-numero');
    VMasker(card).maskPattern(cardMask[0]);
    // cpf.addEventListener('input', inputHandler.bind(undefined, cardMask, 14), false);

    const vencimentoMask = ['99/99'];
    const vencimento = document.querySelector('#cc-expiracao');
    VMasker(vencimento).maskPattern(vencimentoMask[0]);
    // cpf.addEventListener('input', inputHandler.bind(undefined, vencimentoMask, 14), false);

    const nascimentoMask = ['99/99/9999'];
    const nascimento = document.querySelector('#dataNascimento');
    VMasker(nascimento).maskPattern(nascimentoMask[0]);
    // cpf.addEventListener('input', inputHandler.bind(undefined, nascimentoMask, 14), false);

    const cvvMask = ['999'];
    const cvv = document.querySelector('#cc-cvv');
    VMasker(cvv).maskPattern(cvvMask[0]);
    // cpf.addEventListener('input', inputHandler.bind(undefined, cvvMask, 14), false);

    const guest = await getGuest(false);
    if (guest)
        $("#fieldNome").hide();


    setPagSeguroRequest();

});