const confirmarPresenca = () => {
    $("#confirmarPresenca").modal('show');
    
    setTimeout(() => {
        $("#quantidade").focus();
    }, 500);
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
    $.ajax({
        url: `/guest`,
        method: "PUT",
        data: JSON.stringify({ 
            confirmado: 1, 
            quantidade_confirmado: quantidade,
        }),
        headers: {
            "Content-Type": "application/json",
            authorization: "Z39SY2"
        },
        complete: (request) => {
            const response = request.responseJSON;
            
            $("#quantidade").val("");
            $("#confirmarPresenca").modal('hide');
            
            if(response.status == 1){
                notificacao("Obrigado!", `Obrigado por confirmar, esperamos você${quantidade > 1 ? 's' : ''} lá!`);
            }
        }
    });
});


$(() => {

    if(!window.localStorage.getItem("GUEST_CODE")){
        document.location = '/login'
    }

});