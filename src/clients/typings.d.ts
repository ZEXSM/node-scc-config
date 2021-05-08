import http from 'http';
import https from 'https'

import { ISpringCloudConfigData } from '../data';

export interface IHttpSpringCloudConfigClient {
    beforeLoad(fn: (requestOptions: http.RequestOptions) => http.RequestOptions): IHttpSpringCloudConfigClient;
    afterLoad(fn: (springCloudConfigData: ISpringCloudConfigData) => void): IHttpSpringCloudConfigClient;
    load(): Promise<void>;
}

interface IHttpsSpringCloudConfigClient {
    beforeLoad(callbackfn: (url: string | URL, requestOptions: https.RequestOptions) => https.RequestOptions): IHttpsSpringCloudConfigClient;
    afterLoad(): IHttpsSpringCloudConfigClient;
    load(): Promise<void>;
}

export type TMapEnvironmentUrl = {
    host: string;
    prefix?: string;
    name: string;
    profiles: string;
    label?: string;
}