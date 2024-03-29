const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const idPresente = urlParams.get('id');

const getPresente = () => {
    $.ajax({
        url: `/gift/${idPresente}`,
        headers: {
            "Content-Type": "application/json",
            authorization: window.GUEST ? window.GUEST.code : "ABCDEF"
        },
        complete: (request) => {
            const response = request.responseJSON;

            if (response.status == 1) {

                $("#boleto").html(`<a class="btn btn-success" href="${response.data.barcode}">Clique aqui</a>`);

                // JsBarcode('#codBarras', response.data.barcode, {
                //     // displayValue: false
                // });
                // $("#valorCodBarras").val(response.data.barcode);

            } else {

                notificacao("Ops!", response.errors[0].msg);
                setTimeout(() => {
                    document.location.href = `/`;
                }, 3000);
            }
        }
    });
};


$("#copiarCodigo").on("click", () => {
    $("#valorCodBarras").select();
    document.execCommand('copy');
});


$(() => {
    getPresente();
});