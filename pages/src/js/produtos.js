const listProdutos = (categoria, titulo) => {

    $.ajax({
        url: `/product/category/${categoria}`,
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        complete: (request) => {
            const response = request.responseJSON;

            $(".titulo-produtos").text(titulo);
            if(response.status == 1){
                let html = '';
                for (let i = 0; i < response.data.length; i++) {
                    const produto = response.data[i];
                    html += `<div class="card col-sm-12 col-md-3 d-flex align-items-center m-4">`;
                    html += `    <img class="card-img-top" src="/media/${produto.imagem}" style="width: 200px" alt="Card image cap">`;
                    html += `    <div class="card-body text-center">`;
                    html += `        <h4 class="card-title">${produto.nome}</h4>`;
                    html += `        <h4>R$ ${produto.valor_minimo.replace('.', ',')}</h4>`;
                    html += `        <a href="/produto?nome=${produto.nome_normalizado}" class="btn btn-success comprar-produto mt-3">Comprar</a>`;
                    html += `    </div>`;
                    html += `</div>`;
                }

                $("#produtos").html(html);
            }
        }
    });
};


$("body").on("click", ".change-categoria", (e) => {
    listProdutos($(e.target).val(), $(e.target).text());
});

$("body").on("click", ".comprar-produto", (e) => {
    console.log($(e.target).attr("id"));
});

$(() => {
    listProdutos(`quarto`, "Quarto");
});