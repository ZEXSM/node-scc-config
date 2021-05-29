import http from 'http';
import https from 'https'
import { URL } from 'url';

import { IDecryptor } from './decryptor';

class ServiceDecryptor implements IDecryptor {
    private readonly url: URL;
    private readonly options: http.RequestOptions | https.RequestOptions;

    public constructor(url: string | URL, options?: http.RequestOptions | https.RequestOptions) {
        this.url = new URL('', url);
        this.options = {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            ...options || {},
        };
    }

    private get protocol() {
        if (this.url.protocol === 'https') {
            return https.request;
        } else {
            return http.request;
        }
    }

    public decrypt(data: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const request = this.protocol(
                this.url,
                this.options,
                response => {
                    let result: Buffer = Buffer.from([]);

                    response
                        .on('data', (chunk: Buffer) => result = Buffer.concat([result, chunk]))
                        .on('end', () => resolve(result));
                });
            request.on('error', error => reject(error));
            request.write(data);
            request.end();
        });
    }
}

export {
    ServiceDecryptor
};