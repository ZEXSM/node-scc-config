import http from 'http';
import { URL } from 'url';

import { ISpringCloudConfigData, SpringCloudConfigData } from './spring-cloud-config-data';

interface IHttpSpringCloudConfigClient {
    beforeLoad(fn: (requestOptions: http.RequestOptions) => http.RequestOptions): IHttpSpringCloudConfigClient;
    afterLoad(fn: (springCloudConfigData: ISpringCloudConfigData) => void): IHttpSpringCloudConfigClient;
    load(): Promise<void>;
}

type TMapEnvironmentUrl = {
    host: string;
    prefix?: string;
    name: string;
    profiles: string;
    label?: string;
}

class HttpSpringCloudConfigClient implements IHttpSpringCloudConfigClient {
    private requestOptions: http.RequestOptions;
    private readonly url: URL;

    private before: ((requestOptions: http.RequestOptions) => http.RequestOptions) | null;
    private after: ((springCloudConfigData: ISpringCloudConfigData) => void) | null;

    public constructor(url: TMapEnvironmentUrl | string) {
        this.requestOptions = {};
        this.url = this.createURL(url);
        this.before = null;
        this.after = null;
    }

    private createURL(url: TMapEnvironmentUrl | string): URL {
        if (!url) {
            throw new Error('"url" argument must be passed');
        }

        const typeUrl = typeof url;

        if (typeUrl === 'string') {
            return new URL(url as string);
        } else if (typeUrl === 'object') {
            const { host, prefix = '', name, profiles, label = '' } = url as TMapEnvironmentUrl;

            if (!host) {
                throw new Error('name of environment "host" must be specified');
            }

            if (!name) {
                throw new Error('name of environment "name" must be specified');
            }

            if (!profiles) {
                throw new Error('name of environment "profiles" must be specified');
            }

            const parts: string[] = ['http://'];
            const hostEnv = process.env[host];

            if (!hostEnv) {
                throw new Error('name of environment "profiles" must be specified');
            }

            parts.push(hostEnv);

            const prefixEnv = process.env[prefix] ?? '';

            if (prefixEnv) {
                parts.push(prefixEnv);
            }

            const nameEnv = process.env[name];

            if (!nameEnv) {
                throw new Error('name of environment "profiles" must be specified');
            }

            parts.push(nameEnv);

            const profilesEnv = process.env[profiles];

            if (!profilesEnv) {
                throw new Error('name of environment "profiles" must be specified');
            }

            const labelEnv = process.env[label] ?? '';

            if (labelEnv) {
                parts.push(labelEnv);
            }

            return new URL(parts.join('/'));
        }

        throw new TypeError('type ${typeUrl} for "url" argument is not supported');
    }

    public load(): Promise<void> {
        return new Promise((resolve, reject) => {
            const options = this.before ? this.before(this.requestOptions) : this.requestOptions;

            http.get(
                this.url,
                options,
                (response) => {
                    let data = '';

                    response.setEncoding('utf8');

                    response.on('data', (chunk) => {
                        data += chunk;
                    });

                    response.on('end', () => {
                        try {
                            const springCloudConfigData = new SpringCloudConfigData(JSON.parse(data));
                            springCloudConfigData.set();

                            if (this.after) {
                                this.after(springCloudConfigData);
                            }

                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });
                })
                .on('error', (e) => reject(e))
                .end();
        })
    }

    public beforeLoad(fn: (requestOptions: http.RequestOptions) => http.RequestOptions): IHttpSpringCloudConfigClient {
        this.before = fn;

        return this;
    }

    public afterLoad(fn: (springCloudConfigData: ISpringCloudConfigData) => void): IHttpSpringCloudConfigClient {
        this.after = fn;

        return this;
    }
}

export {
    HttpSpringCloudConfigClient,
    IHttpSpringCloudConfigClient
};