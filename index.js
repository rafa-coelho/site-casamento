const express = require('express');
const cors = require('cors');
const path = require('path');

const consign = require('consign');
const app = express();

app.use(cors());
app.use(express.json());

consign().include('controllers').into(app);

app.listen(3333, () => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log("Rodando na porta 3333");
});