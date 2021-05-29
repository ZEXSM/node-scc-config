import express from "express";

import { SpringCloudConfigClient } from "../src";
import { getConfiguration } from "../src/configuration";
import { ServiceDecryptor } from "../src/decryptors";

const app = express();

process.env["HOST"] = 'test'
process.env["PROJECT_NAME"] = 'app-settings'
process.env["SERVICE_NAME"] = 'app-service'
process.env["SPRING_CLOUD_PROFILES"] = 'development'

type TestServiceConfig = {
    block1: {
        Url: string;
    };
    block2: {
        Url: string;
    };
    block3: {
        appService: {
            Url: string;
            UserName: string;
            Password: string;
        };
    };
};

app.get("/", async (_, response) => {
    try {
        const config = getConfiguration<TestServiceConfig>();

        response.json(config);
    } catch (e) {
        response.send(e.message);
    }
});


app.listen(3000, async () => {
    const client = new SpringCloudConfigClient(
        `http://${process.env["HOST"]}/${process.env["PROJECT_NAME"]}/${process.env["SERVICE_NAME"]}/${process.env["SPRING_CLOUD_PROFILES"]}`);

    await client
        .beforeLoad(s => ({
            ...s,
            port: 80
        }))
        .afterLoad(d => {
            d
                .setChipherMarker('{cipher}')
                // .setDecryptor(new AesDecryptor('password'));
                .setDecryptor(new ServiceDecryptor(
                    `http://${process.env["HOST"]}/${process.env["PROJECT_NAME"]}/decrypt`));
        })
        .load();
});