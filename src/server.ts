import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());


app.listen(3333, () => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log("Rodando na porta 3333");
});