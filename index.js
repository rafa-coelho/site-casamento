const express = require('express');
const cors = require('cors');
const path = require('path');

const consign = require('consign');
const app = express();

app.use(cors());
app.use(express.json());

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

consign().include('controllers').into(app);

app.listen(3333, async () => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log("Rodando na porta 3333");
});