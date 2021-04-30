
import express from "express";

import { decrypt } from "../src";

const app = express();

const cipherText = 'b165fc8cd067ae55136dea4ab478b5a1f157eba5df173c04e51b6982c06c682e';
const password = '12345678';


app.get("/", (request, response) => {
    response.send(`<h2>${decrypt(password, cipherText)}</h2>`);
});


app.listen(3000);