const express = require('express');
const cors = require('cors');
const path = require('path');

const consign = require('consign');
const app = express();

app.use(cors());
app.use(express.json());

require('dotenv').config();
global.ROOT = __dirname;
global.PROD = process.env.NODE_ENV == 'prod';
global.PS_TOKEN = process.env.PS_TOKEN;

const fs = require("fs");

const directories = ["System", "classes"];
directories.forEach(dir => {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(function(file) {
            console.log(file)
            const Class = require(`./${dir}/${file}`);
            global[file.split(".")[0]] = Class;
        });
    } catch (e) {
        console.log(e);
    }
});


consign().include('controllers').into(app);

app.use(`/media`, express.static(path.resolve(__dirname, 'media')));
app.use(`/src`, express.static(path.resolve(__dirname, 'pages/src')));

const port = 3000;

app.listen(port, async() => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log(`Rodando na porta ${port}`);
});