const updateGuest = (code, data) => {
    $.ajax({
        url: `/guest`,
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            authorization: 'Z39SY2'
        },
        data: JSON.stringify(data),
        complete: (request) => {
            const response = request.responseJSON;

            console.log(response);
            if (response.status == 1){

            }

        }
    });
};

$("#entrar").on("submit", (e) => {
    e.preventDefault();

    $.ajax({
        url: `/guest/${$("#codigo").val()}`,
        complete: (request) => {
            const response = request.responseJSON;

            if (response.status == 1) {
                updateGuest($("#codigo").val(), { whatsapp: $("#whatsapp").val() });
                $(".resposta").css("color", "green");
                $(".resposta").text("Bem vindo!");
                $(".resposta").fadeIn();
                setTimeout(() => {
                    $(".resposta").fadeOut();
                    setCookie("GUEST_CODE", response.data.code, 1);

                    // window.localStorage.setItem("GUEST_CODE", response.data.code);
                    window.location.href = `/`;
                }, 2000);

            } else {
                $(".resposta").css("color", "red");
                $(".resposta").text(response.errors[0].msg);
                $(".resposta").fadeIn();
                setTimeout(() => {
                    $(".resposta").fadeOut();
                }, 2000);
            }
        }
    });

});


$(() => {
    if(getCookie("GUEST_CODE")){
        document.location.href = '/'
    }
});