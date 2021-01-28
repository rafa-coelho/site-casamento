$(".change-forma-pagamento").on("click", (e) => {
    $(".change-forma-pagamento").removeClass("active");
    $(e.target).addClass("active");
});

$("body").on("submit", "#comprarBoleto", (e) => {
    e.preventDefault();

    const produto = $("#produto").val();
    const nome = window.GUEST.nome;
    const email = $(e.target).find("#email").val();
    const cpf = $(e.target).find("#cpf").val().replace(/\D/g, '');
    const valor = $("#valor").val();

    $(".btnConfirmar").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);

    $.ajax({
        url: `/product/${produto}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: window.GUEST.code
        },
        data: JSON.stringify({
            nome, email, cpf, valor, forma_pagamento: "BOLETO"
        }),
        complete: (request) => {
            $(".btnConfirmar").html("Confirmar");
            
            const response = request.responseJSON;

            if(response.status == 1){
                document.location = `/compra-confirmada?id=${response.data.id}`
            }else{
                notificacao("Ops!", response.errors[0].msg);
            }
        }
    });

});

$("body").on("submit", "#comprarCartao", (e) => {
    e.preventDefault();

    const produto = $("#produto").val();
    const valor = $("#valor").val();

    const cartao = {
        nome: $(e.target).find("#cc-nome").val(),
        numero: $(e.target).find("#cc-numero").val(),
        cvv: $(e.target).find("#cc-cvv").val(),
        mes: $(e.target).find("#cc-expiracao").val().split("/")[0],
        ano: '20' + $(e.target).find("#cc-expiracao").val().split("/")[1],
    }

    $(".btnConfirmar").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);

    $.ajax({
        url: `/product/${produto}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: window.GUEST.code
        },
        data: JSON.stringify({
            cartao, valor, forma_pagamento: "CREDIT_CARD"
        }),
        complete: (request) => {
            $(".btnConfirmar").html("Confirmar");
            
            const response = request.responseJSON;

            if(response.status == 1){
                
                notificacao("Obrigado!", "Obrigado pelo seu pesente! ♥");
            }else{
                notificacao("Ops!", response.errors[0].msg);
            }
        }
    });

});

$(() => {
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

            if(response.status == 1){
                $("#imagem").attr("src", `/media/${response.data.imagem}`)
                $("#tituloProduto").text(response.data.nome);
                $("#valorProduto").text("R$ " + response.data.valor_minimo.replace('.', ','));
                $("#valor").val(response.data.valor_minimo);
                $("#produto").val(response.data.id);
            }
        }
    });

    
    function inputHandler(masks, max, event) {
        var c = event.target;
        var v = c.value.replace(/\D/g, '');
        var m = c.value.length > max ? 1 : 0;
        VMasker(c).unMask();
        VMasker(c).maskPattern(masks[m]);
        c.value = VMasker.toPattern(v, masks[m]);
    }
    
    const cpfMask = ['999.999.999-99'];
    const cpf = document.querySelector('#cpf');
    VMasker(cpf).maskPattern(cpfMask[0]);
    cpf.addEventListener('input', inputHandler.bind(undefined, cpfMask, 14), false);
    
    const cardMask = ['9999.9999.9999.9999'];
    const card = document.querySelector('#cc-numero');
    VMasker(card).maskPattern(cardMask[0]);
    cpf.addEventListener('input', inputHandler.bind(undefined, cardMask, 14), false);
    
    const vencimentoMask = ['99/99'];
    const vencimento = document.querySelector('#cc-expiracao');
    VMasker(vencimento).maskPattern(vencimentoMask[0]);
    cpf.addEventListener('input', inputHandler.bind(undefined, vencimentoMask, 14), false);
    
    const cvvMask = ['999'];
    const cvv = document.querySelector('#cc-cvv');
    VMasker(cvv).maskPattern(cvvMask[0]);
    cpf.addEventListener('input', inputHandler.bind(undefined, cvvMask, 14), false);

});