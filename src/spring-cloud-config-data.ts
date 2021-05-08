import { ITextDecryptor, TextDecryptor } from './text-decryptor';

interface ISpringCloudConfigData {
    get<T>(): T;
    set<T>(): ISpringCloudConfigData;
    setDecrypt(textDecryptor: ITextDecryptor): ISpringCloudConfigData;
}

class SpringCloudConfigData implements ISpringCloudConfigData {

    private data: Record<string, string>;
    private textDecryptor: ITextDecryptor;

    public constructor(data: any) {
        this.data = data;
        this.textDecryptor = new TextDecryptor();
    }

    setDecrypt(textDecryptor: ITextDecryptor): ISpringCloudConfigData {
        if (!textDecryptor) {
            throw new Error('textDecryptor is null');
        }

        this.textDecryptor = textDecryptor;

        return this;
    }

    set<T>(): ISpringCloudConfigData {
        for (let key in Object.keys(this.data)) {
            if (this.data[key].startsWith('{chipher}')) {
                this.data[key] = this.textDecryptor.decrypt('password', this.data[key].replace('{chipher}', '')).toString('utf8');
            }
        }

        (process.env as NodeJS.Dict<T>)["SPRING_CLOUD_CONFIG_SOURCE"] = this.data as unknown as T;

        return this;
    }

    get<T>(): T {
        return (process.env as NodeJS.Dict<T>)["SPRING_CLOUD_CONFIG_SOURCE"] ?? {} as T;
    }
}

export {
    SpringCloudConfigData,
    ISpringCloudConfigData
}