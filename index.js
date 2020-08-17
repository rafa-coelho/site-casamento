const express = require('express');
const cors = require('cors');
const path = require('path');

const consign = require('consign');
const app = express();

app.use(cors());
app.use(express.json());

require('dotenv').config();
global.PROD = process.env.NODE_ENV == 'prod';
global.PS_TOKEN = process.env.PS_TOKEN;

const fs = require("fs");
const directories = ["System", "classes"];
directories.forEach(dir => {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(function (file) {
            const Class = require(`./${dir}/${file}`);
            global[file.split(".")[0]] = Class;
        });
    } catch (e) {
        console.log(e);
    }
});

// app.use(async (req, res, next) => {
//     const { headers, body } = req;
//     const resp = {
//         status: 0,
//         msg: "",
//         data: null,
//         errors: []
//     };

//     if (!headers['authorization']) {
//         resp.errors.push({
//             msg: "Informe o código do convidado"
//         });
//         return res.status(403).send(resp);
//     }

//     const convidado = await Convidado.GetFirst(`code = '${headers['authorization']}'`);

//     if (!convidado) {
//         resp.errors.push({
//             msg: "Convidado não encontrado!"
//         });
//         return res.status(403).send(resp);
//     }

//     res.convidado = convidado;
//     next();
// });

consign().include('controllers').into(app);

app.listen(3333, async () => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log("Rodando na porta 3333");
});