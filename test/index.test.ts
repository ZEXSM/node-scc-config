import { TextDecryptor } from '../src/text-decryptor';

test('decrypt of encrypt in the spring cloud config data', () => {
    const ciphertext = '6f734043516cbbbcce10d16189cf42fd51348e82dc480eb0fcc0829c544ef38c';
    const password = '89073846';

    const decrypted = new TextDecryptor().decrypt(password, ciphertext).toString('utf8');

    expect(decrypted).toBe('ProstoTest');
});