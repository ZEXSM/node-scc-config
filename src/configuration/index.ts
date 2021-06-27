export * from './configuration-store'

export const getConfiguration = <T>(): T => {
    const source = JSON.parse(process.env['SPRING_CLOUD_CONFIG_SOURCE'] || '{}') || {};

    return source;
}