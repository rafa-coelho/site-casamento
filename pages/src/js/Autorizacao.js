const notificacao = (titulo, mensagem) => {
    $("#tituloNotficacao").text(titulo);
    $("#mensagemNotificacao").text(mensagem);

    $("#notificacao").modal("show");
    setTimeout(() => {
        $("#notificacao").modal("hide");
    }, 5000);
};

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const getGuest = (redirect = true) => new Promise((resolve) => {

    const code = getCookie("GUEST_CODE");

    if (!code && redirect)
        document.location.href = '/login';

    $.ajax({
        url: `/guest`,
        headers: {
            "Content-Type": "application/json",
            authorization: code
        },
        complete: (request) => {
            const response = request.responseJSON;

            if (response.status == 1) {
                window.GUEST = response.data;
                resolve(true);
            } else {
                resolve(false);
            }

        }
    });
});

const Login = (codigo = "_") => new Promise((resolve, reject) => {
    $.ajax({
        url: `/guest/${codigo}`,
        complete: (request) => {
            const response = request.responseJSON;

            if (response.status == 1) {
                setCookie("GUEST_CODE", response.data.code, 1);
                resolve(response.data.code);
            } else {
                setCookie("GUEST_CODE", null, 1);
                reject(response.errors[0].msg);
            }
        }
    });
});

// if (document.location.pathname !== '/login')
// getGuest(false);