import { pbkdf2Sync, createDecipheriv } from 'crypto';

import CONST from './constants';
import { ICipherTextIV } from './typings';

export const createKey = (password: Uint8Array, salt: Uint8Array): Uint8Array =>
    pbkdf2Sync(password, salt, CONST.ITERATIONS, CONST.KEY_LENGTH, CONST.DIGEST);

export const getCipheriv = (data: string): ICipherTextIV => {
    const dataHex: Uint8Array = Buffer.from(data, 'hex');
    const iv = dataHex.slice(0, CONST.INITIAL_VECTOR);
    const ciphertext = dataHex.slice(CONST.INITIAL_VECTOR, dataHex.length);

    return {
        iv,
        ciphertext,
    };
};

export const decrypt = (password: string, data: string, salt = CONST.DEFAULT_SALT): Buffer => {
    const key = createKey(Buffer.from(password), Buffer.from(salt, 'hex'));
    const { iv, ciphertext } = getCipheriv(data);
    const decipher = createDecipheriv(CONST.ALGORITHM_NAME, key, iv);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

export default {
    createKey,
    getCipheriv,
    decrypt,
};
