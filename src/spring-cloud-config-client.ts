import http from 'http';
import https from 'https';
import { URL } from 'url';

import { ConfigurationStore, IConfigurationStore } from './configuration';

interface ISpringCloudConfigClient {
    beforeLoad(fn: (requestOptions: http.RequestOptions) => http.RequestOptions): ISpringCloudConfigClient;
    afterLoad(fn: (springCloudConfigData: IConfigurationStore) => void): ISpringCloudConfigClient;
    load(): Promise<void>;
}

class SpringCloudConfigClient implements ISpringCloudConfigClient {
    private readonly url: URL;

    private requestOptions: http.RequestOptions | https.RequestOptions;
    private before: ((requestOptions: http.RequestOptions | https.RequestOptions) => http.RequestOptions | https.RequestOptions) | null;
    private after: ((springCloudConfigData: IConfigurationStore) => void) | null;

    public constructor(url: string | URL) {
        this.url = new URL('', url);
        this.requestOptions = {};
        this.before = null;
        this.after = null;
    }

    private get protocol() {
        if (this.url.protocol === 'https:') {
            return https.get;
        } else {
            return http.get;
        }
    }

    public load(): Promise<void> {
        return new Promise((resolve, reject) => {
            const options = this.before ?
                this.before(this.requestOptions)
                :
                this.requestOptions;

            this.protocol(
                this.url,
                options,
                response => {
                    let data = '';

                    response
                        .setEncoding('utf8')
                        .on('data', (chunk: string) => {
                            data += chunk;
                        })
                        .on('end', async () => {
                            try {
                                const configurationStore = new ConfigurationStore(JSON.parse(data));

                                if (this.after) {
                                    this.after(configurationStore);
                                }

                                await configurationStore.set();

                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        });
                })
                .on('error', error => reject(error))
                .end();
        });
    }

    public beforeLoad(fn: (requestOptions: http.RequestOptions | https.RequestOptions) => http.RequestOptions | https.RequestOptions): ISpringCloudConfigClient {
        this.before = fn;

        return this;
    }

    public afterLoad(fn: (springCloudConfigData: IConfigurationStore) => void): ISpringCloudConfigClient {
        this.after = fn;

        return this;
    }
}

export {
    ISpringCloudConfigClient,
    SpringCloudConfigClient
};
