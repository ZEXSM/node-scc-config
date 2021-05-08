
import express from "express";
import { TextDecryptor } from "../src/text-decryptor";

import { HttpSpringCloudConfigClient } from '../src/http-spring-cloud-config-client';

const app = express();

const cipherText = 'b165fc8cd067ae55136dea4ab478b5a1f157eba5df173c04e51b6982c06c682e';
const password = '12345678';

app.get("/", (request, response) => {
    new HttpSpringCloudConfigClient({
        host: 'H',
        prefix: 'UP',
        name: 'AN',
        profiles: 'P',
        label: 'L'
    })
        .beforeLoad(s => ({
            ...s,
            port: 90
        }))
        .afterLoad(d => d.setDecrypt(null))
        .load()
        .then()
        .catch(d => console.log(d));

    response.send(`<h2>${new TextDecryptor().decrypt(password, cipherText)}}</h2>`);
});


app.listen(3000);