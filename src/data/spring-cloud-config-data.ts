import { AesTextDecryptor, ITextDecryptor } from "../decryptors";
import { ISpringCloudConfigData } from "./typings";

class SpringCloudConfigData implements ISpringCloudConfigData {

    private data: Record<string, string>;
    private textDecryptor: ITextDecryptor;

    public constructor(data: any) {
        this.data = data;
        this.textDecryptor = new AesTextDecryptor();
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
    SpringCloudConfigData
}