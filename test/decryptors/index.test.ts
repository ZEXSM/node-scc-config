import nock from 'nock';

import { AesDecryptor, ServiceDecryptor } from '../../src/decryptors'

describe('decrypt of encrypt in the spring cloud config data', () => {
    test('AesDecryptor decrypt => success', async () => {
        const ciphertext = '6f734043516cbbbcce10d16189cf42fd51348e82dc480eb0fcc0829c544ef38c';
        const password = '89073846';

        const decrypted = await new AesDecryptor(password).decrypt(ciphertext);

        expect(decrypted.toString('utf8')).toBe('ProstoTest');
    });

    describe('ServiceDecryptor decrypt => success', () => {
        const ciphertext = '6f734043516cbbbcce10d16189cf42fd51348e82dc480eb0fcc0829c544ef38c';

        beforeAll(() => {
            nock('http://test')
                .persist()
                .matchHeader('Content-Type', 'text/plain')
                .post('/decrypt')
                .reply(200, 'ProstoTest');

            nock('https://test')
                .persist()
                .matchHeader('Content-Type', 'text/plain')
                .post('/decrypt')
                .reply(200, 'ProstoTest');
        })

        test('http', async () => {
            const url = 'http://test/decrypt';

            const decrypted = await new ServiceDecryptor(url).decrypt(ciphertext);

            expect(decrypted.toString('utf8')).toBe('ProstoTest');
        });

        test('https', async () => {
            const url = 'https://test/decrypt';

            const decrypted = await new ServiceDecryptor(url).decrypt(ciphertext);

            expect(decrypted.toString('utf8')).toBe('ProstoTest');
        });
    });
});