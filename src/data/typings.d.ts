import { ITextDecryptor } from "../decryptors";

export interface ISpringCloudConfigData {
    get<T>(): T;
    set<T>(): ISpringCloudConfigData;
    setDecrypt(textDecryptor: ITextDecryptor): ISpringCloudConfigData;
}