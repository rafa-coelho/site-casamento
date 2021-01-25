$(".change-forma-pagamento").on("click", (e) => {
    $(".change-forma-pagamento").removeClass("active");
    $(e.target).addClass("active");
});

$("body").on("submit", "#comprarBoleto", (e) => {
    e.preventDefault();

    const produto = $(e.target).find("#produto").val();
    const nome = $(e.target).find("#nome").val();
    const email = $(e.target).find("#email").val();
    const cpf = $(e.target).find("#cpf").val().replace(/\D/g, '');
    const valor = $(e.target).find("#valor").val();

    $.ajax({
        url: `/product/${produto}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: 'Z39SY2'
        },
        data: JSON.stringify({
            nome, email, cpf, valor, forma_pagamento: "BOLETO"
        }),
        complete: (request) => {
            const response = request.responseJSON;

            if(response.status == 1){
                console.log(response)
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
    
    var cpfMask = ['999.999.999-99'];
    var cpf = document.querySelector('#cpf');
    VMasker(cpf).maskPattern(cpfMask[0]);
    cpf.addEventListener('input', inputHandler.bind(undefined, cpfMask, 14), false);



});