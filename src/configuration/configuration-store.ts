import { IDecryptor } from "../decryptors";

interface IConfigurationStore {
    setDecryptor(decryptor: IDecryptor): void;
    setChipherMarker(name: string): IConfigurationStore;
    setPrepareSource<T>(prepareSource: (source: Record<string, any>) => T): IConfigurationStore;
    setMergeSource<T>(mergeSource: (configuration?: TConfiguration<T>) => T): IConfigurationStore;
}

type TConfiguration<T> = {
    name: string;
    profiles: string[];
    label?: string;
    version?: string;
    state?: unknown;
    propertySources: TPropertySource<T>[];
};

type TPropertySource<T> = {
    name: string;
    source: T;
};

class ConfigurationStore<T> implements IConfigurationStore {

    private readonly storeKey = 'NODE-SCC-CONFIG';
    private readonly configuration?: TConfiguration<T>;

    private chipherMarker: string;
    private decryptor: IDecryptor | null;
    private prepareSource: ((source: Record<string, any>) => T) | null;
    private mergeSource: ((configuration?: TConfiguration<T>) => T) | null;

    public constructor(configuration?: TConfiguration<T>) {
        this.configuration = configuration;
        this.chipherMarker = '{cipher}';
        this.decryptor = null;
        this.prepareSource = null;
        this.mergeSource = null;
    }

    public setChipherMarker(name: string): IConfigurationStore {
        this.chipherMarker = name;

        return this;
    }

    public setDecryptor(decryptor: IDecryptor): void {
        if (!decryptor) {
            throw new Error('decryptor is null');
        }

        this.decryptor = decryptor;
    }

    public setPrepareSource<T>(prepareSource: (source: Record<string, any>) => T): IConfigurationStore {
        if (!prepareSource) {
            throw new Error('prepareSource is null');
        }

        (this.prepareSource as unknown as (source: T) => T) = prepareSource;

        return this;
    }

    public setMergeSource<T>(mergeSource: (configuration?: TConfiguration<T>) => T): IConfigurationStore {
        if (!mergeSource) {
            throw new Error('mergeSource is null');
        }

        (this.mergeSource as unknown as (configuration?: TConfiguration<T>) => T) = mergeSource;

        return this;
    }

    public async set(): Promise<void> {
        let source: Record<string, any> = {};

        if (this.mergeSource) {
            source = this.mergeSource(this.configuration);
        } else {
            const propertySources = this.configuration?.propertySources ?? [];

            for (let i = propertySources.length - 1; i >= 0; i--) {
                source = { ...source, ...propertySources[i].source };
            }
        }

        if (Object.keys(source).length === 0) {
            return;
        }

        if (this.decryptor) {
            source = await this.decryptSource(source);
        }

        let sourceObj: Record<string, any> = {};

        if (this.prepareSource) {
            sourceObj = this.prepareSource(source as T);
        } else {
            for (const [key, value] of Object.entries(source)) {
                const keys = key.split('.');
                this.createSourceObject(keys, sourceObj, value);
            }
        }

        process.env[this.storeKey] = JSON.stringify(sourceObj);
    }

    public get<T>(): T {
        return JSON.parse(process.env[this.storeKey] || '{}') || {};
    }

    private createSourceObject(keys: string[], obj: Record<string, any>, value: string) {
        const key = keys.shift();

        if (!key) {
            return;
        }

        const keyArrayMatch = key.match(/^(\S+)\[\d+\]$/);

        if (keyArrayMatch) {
            const [, keyArray] = keyArrayMatch;

            if (!obj[keyArray]) {
                obj[keyArray] = [value];
            } else {
                obj[keyArray].push(value);
            }

            return;
        }

        if (keys.length === 0) {
            obj[key] = value;
            return;
        }

        if (!obj[key]) {
            obj[key] = {};
        }

        this.createSourceObject(keys, obj[key], value);
    }

    private async decryptSource(source: Record<string, any>): Promise<Record<string, any>> {
        for (const key of Object.keys(source)) {
            if (source[key]
                && typeof source[key] === 'string'
                && source[key].startsWith(this.chipherMarker)) {

                const data = source[key].replace(this.chipherMarker, '');

                const decriyptingData = await this.decryptor!.decrypt(data);

                source[key] = decriyptingData.toString('utf8');
            }
        }

        process.env[this.storeKey] = JSON.stringify(source);

        return source;
    }
}


export {
    TConfiguration,
    TPropertySource,
    IConfigurationStore,
    ConfigurationStore,
};