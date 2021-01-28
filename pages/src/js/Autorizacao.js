const notificacao = (titulo, mensagem) => {
    $("#tituloNotficacao").text(titulo);
    $("#mensagemNotificacao").text(mensagem);

    $("#notificacao").modal("show");
    setTimeout(() => {
        $("#notificacao").modal("hide");
    }, 5000);
};

const getGuest = () => {
    const code = window.localStorage.getItem("GUEST_CODE");

    if(!code)
        document.location.href = '/login';

    $.ajax({
        url: `/guest`,
        headers: {
            "Content-Type": "application/json",
            authorization: code
        },
        complete: (request) => {
            const response = request.responseJSON;

            if(response.status == 1){
                window.GUEST = response.data;
            }

        }
    });

};
getGuest();
