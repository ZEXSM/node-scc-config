import { pbkdf2Sync, createDecipheriv } from 'crypto';
import { IDecryptor } from './decryptor';

type TCipherIV = {
    iv: Uint8Array;
    cipherHex: Uint8Array;
}

class AesDecryptor implements IDecryptor {
    protected readonly DEFAULT_SALT = 'deadbeef';
    protected readonly ALGORITHM_NAME = 'aes-256-cbc';
    protected readonly DIGEST = 'sha1';
    protected readonly ITERATIONS = 1024;
    protected readonly KEY_LENGTH = 32;
    protected readonly INITIAL_VECTOR = 16;

    private readonly password: string;
    private readonly salt?: string | null;

    public constructor(password: string, salt?: string | null) {
        this.password = password;
        this.salt = salt;
    }

    protected createKey(password: Uint8Array, salt: Uint8Array): Uint8Array {
        return pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.DIGEST);
    }

    protected getCipherIV(data: string): TCipherIV {
        const dataHex: Uint8Array = Buffer.from(data, 'hex');
        const iv = dataHex.slice(0, this.INITIAL_VECTOR);
        const cipherHex = dataHex.slice(this.INITIAL_VECTOR, dataHex.length);

        return {
            iv,
            cipherHex,
        };
    }

    public decrypt(data: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const key = this.createKey(Buffer.from(this.password), Buffer.from(this.salt || this.DEFAULT_SALT, 'hex'));
                const { iv, cipherHex } = this.getCipherIV(data);
                const decipher = createDecipheriv(this.ALGORITHM_NAME, key, iv);

                resolve(Buffer.concat([decipher.update(cipherHex), decipher.final()]));
            } catch (error) {
                reject(error);
            }
        });
    }
}

export {
    AesDecryptor
};