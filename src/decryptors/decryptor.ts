export interface IDecryptor {
    decrypt(data: string): Promise<Buffer>;
}
