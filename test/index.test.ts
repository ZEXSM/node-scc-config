import nock from 'nock';
import path from 'path';

import { SpringCloudConfigClient } from '../src';
import { getConfiguration } from '../src/configuration';

type TestConfig = {
    logLevel: string;
    options: {
        service: {
            url: string;
            login: string;
            password: string;
            whitelist: number[];
        };
    };
    objects: { id: string; code: string }[]
    testOptions: {
        url: string;
    };
};

describe('nodejs client for spring cloud config', () => {
    const serviceName = 'test-service';
    const obj = {
        "logLevel": "fatal",
        "options": {
            "service": {
                "url": "http://app-service/endpoint",
                "login": "tech",
                "password": "{cipher}5eec033b24bc736fcbdbe1cf496149fbd1db16fd096264326e9c18f80d85b742",
                "whitelist": [4441, 4442, 4443, 3334]
            }
        },
        "testOptions": {
            "url": "http://${HOST}/${SERVICE_NAME}/endpoint-test"
        },
        "objects": [
            { "id": "723684683264", "code": "tes_code" },
            { "id": "899778923444", "code": "tes_code1" }
        ]
    };

    beforeAll(() => {
        nock('http://test')
            .persist()
            .get(`/${serviceName}/development`)
            .replyWithFile(200, path.resolve('./example/response.json'), {
                'Content-Type': 'application/json',
            });

        nock('https://test')
            .persist()
            .get(`/${serviceName}/development`)
            .replyWithFile(200, path.resolve('./example/response.json'), {
                'Content-Type': 'application/json',
            });
    });

    test('load by http', async () => {
        const url = `http://test/${serviceName}/development`;

        const client = new SpringCloudConfigClient(url);

        await client.load();

        expect(getConfiguration<TestConfig>()).toEqual(obj);
    });

    test('load by https', async () => {
        const url = `https://test/${serviceName}/development`;

        const client = new SpringCloudConfigClient(url);

        await client.load();

        expect(getConfiguration<TestConfig>()).toEqual(obj);
    });
});