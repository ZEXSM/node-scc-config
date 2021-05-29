import { IDecryptor } from "../decryptors";

interface IConfigurationStore {
    setDecryptor(decryptor: IDecryptor): void;
    setChipherMarker(name: string): IConfigurationStore;
}

type TConfiguration<T> = {
    name: string;
    profiles: string[];
    label?: string;
    version?: string;
    state: unknown;
    propertySources: TPropertySource<T>[];
};

type TPropertySource<T> = {
    name: string;
    source: T;
};

class ConfigurationStore<T> implements IConfigurationStore {

    private readonly storeKey = 'SPRING_CLOUD_CONFIG_SOURCE';
    private readonly configuration: TConfiguration<T>;

    private decryptor: IDecryptor | null;
    private chipherMarker: string;

    public constructor(configuration: TConfiguration<T>) {
        this.configuration = configuration;
        this.chipherMarker = '{cipher}';
        this.decryptor = null;
    }

    public setChipherMarker(name: string): IConfigurationStore {
        // TODO: нужен тольк для ases decryptor
        this.chipherMarker = name;

        return this;
    }

    public setDecryptor(decryptor: IDecryptor): void {
        if (!decryptor) {
            throw new Error('decryptor is null');
        }

        this.decryptor = decryptor;
    }

    public async set(): Promise<void> {
        let source = this.configuration.propertySources[0]?.source;

        if (!source) {
            return;
        }

        if (this.decryptor) {
            source = await this.decriptSource(source) as T;
        }

        process.env[this.storeKey] = JSON.stringify(source);
    }

    public get<T>(): T {
        const source = JSON.parse(process.env[this.storeKey] ?? '{}') ?? {};

        return source;
    }

    private async decriptSource(source: Record<string, any>): Promise<Record<string, any>> {
        for (let key of Object.keys(source)) {
            if (source[key]?.startsWith(this.chipherMarker)) {
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
    IConfigurationStore,
    ConfigurationStore
}