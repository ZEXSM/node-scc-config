import { ConfigurationStore } from './configuration-store';

export * from './configuration-store'

export const getConfiguration = <T>(): T => {
    const configurationStore = new ConfigurationStore();

    return configurationStore.get<T>();
}