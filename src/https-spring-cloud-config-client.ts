import http from 'http';
import https from 'https'

interface IHttpsSpringCloudConfigClient {
    beforeLoad(callbackfn: (url: string | URL, requestOptions: https.RequestOptions) => https.RequestOptions): IHttpsSpringCloudConfigClient;
    afterLoad(): IHttpsSpringCloudConfigClient;
    load(): Promise<void>;
}

type TOptions = {
    baseUrl: string;
    name: string;
    profiles: string[];
    label?: string;
}

type TEnvironmentOptions = {
    host: string;
    prefix?: string;
    name: string;
    profiles: string[];
    label?: string;
}

class HttpsSpringCloudConfigClient implements IHttpsSpringCloudConfigClient {
    private fetch: (url: string | URL, options: https.RequestOptions, callback?: (res: http.IncomingMessage) => void) => http.ClientRequest;
    private requestOptions: https.RequestOptions;

    public constructor(options: TOptions | TEnvironmentOptions) {
        this.fetch = https.get as (url: string | URL, options: https.RequestOptions, callback?: (response: http.IncomingMessage) => void) => http.ClientRequest
        this.requestOptions = {};
    }

    public load(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fetch(
                `${baseUrl}/${name}/${profiles}/${label}`,
                this.requestOptions,
                (response) => {
                    let data = '';

                    response.setEncoding('utf8');

                    response.on('data', (chunk) => {
                        data += chunk;
                    });

                    response.on('end', () => {
                        try {
                            const body = JSON.parse(data);
                            process.env["SPRING_CLOUD_CONFIG_SOURCE"] = body;
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

    public beforeLoad(callbackfn: (url: string | URL, requestOptions: https.RequestOptions) => https.RequestOptions): IHttpsSpringCloudConfigClient {
        this.requestOptions = callbackfn(this.url, this.requestOptions);

        return this;
    }

    public afterLoad(): IHttpsSpringCloudConfigClient {
        return this;
    }
}

export {
    HttpsSpringCloudConfigClient,
    IHttpsSpringCloudConfigClient
};