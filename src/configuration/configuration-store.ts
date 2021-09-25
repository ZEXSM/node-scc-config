import { IDecryptor } from "../decryptors";

interface IConfigurationStore {
    setDecryptor(decryptor: IDecryptor): IConfigurationStore;
    setChipherMarker(name: string): IConfigurationStore;
    setReplacer(template: Record<string, string>): IConfigurationStore;
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
    private template: Record<string, string> | null;
    private decryptor: IDecryptor | null;
    private prepareSource: ((source: Record<string, any>) => T) | null;
    private mergeSource: ((configuration?: TConfiguration<T>) => T) | null;

    public constructor(configuration?: TConfiguration<T>) {
        this.configuration = configuration;
        this.chipherMarker = '{cipher}';
        this.template = null;
        this.decryptor = null;
        this.prepareSource = null;
        this.mergeSource = null;
    }

    public setChipherMarker(name: string): IConfigurationStore {
        this.chipherMarker = name;

        return this;
    }

    public setReplacer(template: Record<string, string>): IConfigurationStore {
        if (!template) {
            throw new Error('template is null');
        }

        this.template = template;

        return this;
    }

    public setDecryptor(decryptor: IDecryptor): IConfigurationStore {
        if (!decryptor) {
            throw new Error('decryptor is null');
        }

        this.decryptor = decryptor;

        return this;
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

        const keysSource = Object.keys(source);

        if (keysSource.length === 0) {
            return;
        }

        if (this.decryptor) {
            source = await this.decryptSource(keysSource, source, this.decryptor);
        }

        if (this.template) {
            source = this.replacer(keysSource, source, this.template);
        }

        let sourceObj: Record<string, any> = {};

        if (this.prepareSource) {
            sourceObj = this.prepareSource(source as T);
        } else {
            for (const [key, value] of Object.entries(source)) {
                const keys = key.split('.');
                this.toObject(keys, sourceObj, value);
            }
        }

        process.env[this.storeKey] = JSON.stringify(sourceObj);
    }

    public get<T>(): T {
        return JSON.parse(process.env[this.storeKey] || '{}') || {};
    }

    private toObject(keys: string[], obj: Record<string, any>, value: string) {
        const key = keys.shift();

        if (!key) {
            return;
        }

        const keyArrayMatch = key.match(/^(\S+)\[(\d+)\]$/);

        if (keyArrayMatch) {
            const [, keyArray, positionArray] = keyArrayMatch;

            if (keys.length > 0) {
                if (!obj[keyArray]) {
                    const arrayObj: Record<string, any> = {};
                    this.toObject(keys, arrayObj, value);
                    obj[keyArray] = [arrayObj];
                } else if (!obj[keyArray][positionArray]) {
                    const arrayObj: Record<string, any> = {};
                    this.toObject(keys, arrayObj, value);
                    obj[keyArray][positionArray] = arrayObj;
                }
                else {
                    const arrayObj = obj[keyArray][positionArray];
                    this.toObject(keys, arrayObj, value);
                    obj[keyArray][positionArray] = arrayObj;
                }
            }
            else {
                if (!obj[keyArray]) {
                    obj[keyArray] = [value];
                } else {
                    obj[keyArray][positionArray] = value;
                }
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

        this.toObject(keys, obj[key], value);
    }

    private replacer(keysSource: string[], source: Record<string, any>, template: Record<string, string>): Record<string, any> {
        const keysTemplate = Object.keys(template);

        for (const keySource of keysSource) {
            const value = source[keySource];

            if (value && typeof value === 'string') {

                for (const keyTemplate of keysTemplate) {
                    source[keySource] = source[keySource].replace(keyTemplate, template[keyTemplate]);
                }
            }
        }

        return source;
    }

    private async decryptSource(keysSource: string[], source: Record<string, any>, decryptor: IDecryptor)
        : Promise<Record<string, any>> {

        for (const keySource of keysSource) {
            const value = source[keySource];

            if (value
                && typeof value === 'string'
                && value.startsWith(this.chipherMarker)) {

                const data = value.replace(this.chipherMarker, '');

                const decriyptingData = await decryptor.decrypt(data);

                source[keySource] = decriyptingData.toString('utf8');
            }
        }

        return source;
    }
}


export {
    TConfiguration,
    TPropertySource,
    IConfigurationStore,
    ConfigurationStore,
};