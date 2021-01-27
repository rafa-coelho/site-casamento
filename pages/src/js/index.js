const confirmarPresenca = () => {

    let htmlInputs = '';
    for (let i = 1; i < window.GUEST.quantidade; i++) {
        htmlInputs += `<div class="form-group">`;
        htmlInputs += `    <label for="acompanhante${i}" class="col-form-label">Acompanhante ${i}</label>`;
        htmlInputs += `    <input type="text" class="form-control" id="acompanhante${i}">`;
        htmlInputs += `</div>`;
    }

    $("#confirmarPresenca").find('.titulo').text(window.GUEST.quantidade > 1 ? "Quem vai poder vir?" : "Você vai poder vir?");
    $("#confirmarPresenca").find('.sim').text(window.GUEST.quantidade > 1 ? "Confirmar" : "Sim");
    $("#confirmarPresenca").find('.nao').text(window.GUEST.quantidade > 1 ? "Fechar" : "Não");

    $("#confirmarPresenca").find('.lista').html(htmlInputs);
    $("#confirmarPresenca").modal('show');
};

const notificacao = (titulo, mensagem) => {
    $("#tituloNotficacao").text(titulo);
    $("#mensagemNotificacao").text(mensagem);

    $("#notificacao").modal("show");
    setTimeout(() => {
        $("#notificacao").modal("hide");
    }, 5000);
};

$(".confirmarPresencaForm").on("submit", (e) => {
    e.preventDefault();

    const quantidade = $(e.target).find('#quantidade').val();

    const acompanhantes = [];
    for (let i = 1; i < window.GUEST.quantidade; i++) {
        const acompanhante = $(e.target).find(`#acompanhante${i}`).val();
        if(acompanhante && acompanhante !== ""){
            acompanhantes.push(acompanhante);
        }
    }


    $.ajax({
        url: `/guest`,
        method: "PUT",
        data: JSON.stringify({
            confirmado: 1,
            quantidade_confirmado: acompanhantes.length + 1,
            acompanhantes
        }),
        headers: {
            "Content-Type": "application/json",
            authorization: window.GUEST.code
        },
        complete: (request) => {
            const response = request.responseJSON;

            $("#quantidade").val("");
            $("#confirmarPresenca").modal('hide');

            if (response.status == 1) {
                notificacao("Obrigado!", `Obrigado por confirmar, esperamos você${quantidade > 1 ? 's' : ''} lá!`);
            }
        }
    });
});