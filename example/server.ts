import express from "express";
import nock from "nock";

import { SpringCloudConfigClient } from "../src";
import { getConfiguration, TConfiguration } from "../src/configuration";
import { ServiceDecryptor } from "../src/decryptors";

const app = express();

process.env["HOST"] = 'test'
process.env["SERVICE_NAME"] = 'app-service'
process.env["SPRING_CLOUD_PROFILES"] = 'development'

type AppServiceApiConfig = {
    logLevel: string;
    options: {
        service: {
            url: string;
            login: string;
            password: string;
        };
    };
    testOptions: {
        url: string;
    };
};

app.get("/", async (_, response) => {
    try {
        const config = getConfiguration<AppServiceApiConfig>();

        response.json(config);
    } catch (e) {
        response.send(e.message);
    }
});


app.listen(3000, async () => {
    nock('http://test')
        .persist()
        .get('/app-service/development')
        .query(true)
        .replyWithFile(200, `${__dirname}/response.json`, {
            'Content-Type': 'application/json',
        });

    nock('http://test')
        .persist()
        .post('/decrypt')
        .query(true)
        .reply(200, 'decrypted');

    try {
        const client = new SpringCloudConfigClient(
            `http://${process.env["HOST"]}/${process.env["SERVICE_NAME"]}/${process.env["SPRING_CLOUD_PROFILES"]}`);
        await client
            .beforeLoad(s => ({
                ...s,
                port: 80
            }))
            .afterLoad(d => {
                d
                    .setChipherMarker('{cipher}')
                    .setMergeSource<AppServiceApiConfig>((configuration?: TConfiguration<AppServiceApiConfig>) => {
                        let source: Record<string, any> = {};
                        const propertySources = configuration?.propertySources ?? [];

                        for (let i = propertySources.length - 1; i >= 0; i--) {
                            source = { ...source, ...propertySources[i].source };
                        }

                        return source as AppServiceApiConfig;
                    })
                    .setPrepareSource<AppServiceApiConfig>((source: Record<string, any>) => {
                        let sourceObj: Record<string, any> = {};

                        const createSourceObject = (keys: string[], obj: Record<string, any>, value: string) => {
                            const key = keys.shift();

                            if (!key) {
                                return;
                            }

                            if (keys.length === 0) {
                                obj[key] = value;
                                return;
                            }

                            if (!obj[key]) {
                                obj[key] = {};
                            }

                            createSourceObject(keys, obj[key], value);
                        }

                        for (const [key, value] of Object.entries(source)) {
                            const keys = key.split('.');
                            createSourceObject(keys, sourceObj, value);
                        }

                        return sourceObj as AppServiceApiConfig;
                    })
                    .setDecryptor(new ServiceDecryptor(
                        `http://${process.env["HOST"]}/decrypt`));
            })
            .load();
    } catch (e) {
        console.log(e);
    }
});