import nock from 'nock';

import { SpringCloudConfigClient } from '../src';
import { getConfiguration, TConfiguration } from '../src/configuration';

describe('nodejs client for spring cloud config', () => {
    const obj = {
        test: 'test value'
    }

    const serviceName = 'app-service';
    const config: TConfiguration<{ test: string }> = {
        name: serviceName,
        profiles: ['development'],
        propertySources: [
            {
                name: 'development',
                source: obj
            }
        ],
    }

    beforeAll(() => {
        nock('http://test')
            .persist()
            .get('/app-service/development')
            .reply(200, config);

        nock('https://test')
            .persist()
            .get('/app-service/development')
            .reply(200, config);
    })

    test('load by http', async () => {
        const url = `http://test/${serviceName}/development`;

        const client = new SpringCloudConfigClient(url);

        await client.load();

        expect(getConfiguration()).toEqual(obj);
    });

    test('load by https', async () => {
        const url = `https://test/${serviceName}/development`;

        const client = new SpringCloudConfigClient(url);

        await client.load();

        expect(getConfiguration()).toEqual(obj);
    });
});