export interface ITextDecryptor {
    decrypt(password: string, data: string, salt?: string): Buffer;
}