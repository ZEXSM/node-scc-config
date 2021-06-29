# Configure your Node.js applications using Spring Cloud Config

[![Build Status](https://travis-ci.com/ZEXSM/node-scc-config.svg?branch=main)](https://travis-ci.com/ZEXSM/node-scc-config)

## Benefits
* Server and client data decryption

## Installation
```shell
$ npm install node-scc-config
```
or
```shell
$ yarn add node-scc-config
```

## Usage

1. Create a client-side pointer to the Spring Cloud Config service
    ```ts
    const client = new SpringCloudConfigClient('http://test/app-service/development');
    ```

2. Configuring the client before calling
    ```ts
    client
        .beforeLoad(s => ({
            ...s,
            port: 9090
        }))
    ```

2. Configuring the client after the call
    > Chipher marker defaults to '{cipher}'
* chipher marker
    ```ts
    client
        .afterLoad(d => d
            .setChipherMarker('{cipher}')
    ```

* data decryption
    * client
        ```ts
        client
            .afterLoad(d => d
                .setDecryptor(new AesDecryptor('password')))
        ```
    * server
        ```ts
        client
            .afterLoad(d => d
                .setDecryptor(new ServiceDecryptor('http://test/decrypt')))
        ```
* source preparation 
    * merge source
        > default implementation example
        ```ts
        client
            .afterLoad(d => d
                .setMergeSource<AppServiceApiConfig>((configuration?: TConfiguration<AppServiceApiConfig>) => {
                    let source: Record<string, any> = {};
                    const propertySources = configuration?.propertySources ?? [];

                    for (let i = propertySources.length - 1; i >= 0; i--) {
                        source = { ...source, ...propertySources[i].source };
                    }

                    return source as AppServiceApiConfig;
                }))
        ```
    * prepare source
        > default implementation example
        ```ts
        client
            .afterLoad(d => d
                .setPrepareSource<AppServiceApiConfig>((source: Record<string, any>)=>{
                    let sourceObj: Record<string, any> = {};

                    const createSourceObject = (keys: string[], obj: Record<string, any>, value: string) => {
                        const key = keys.shift();

                        if (!key) {
                            return;
                        }

                        if (keys.length === 0) {
                            obj[key] = value;
                            return;
                        }

                        if (!obj[key]) {
                            obj[key] = {};
                        }

                        createSourceObject(keys, obj[key], value);
                    }

                    for (const [key, value] of Object.entries(source)) {
                        const keys = key.split('.');
                        createSourceObject(keys, sourceObj, value);
                    }

                    return sourceObj as AppServiceApiConfig;
                }))
        ```
3. Loading the configuration
    ```ts
    await client.load();
    ```

4. Using the loaded configuration
    ```ts
    type AppServiceApiConfig = {
        logLevel: string;
        options: {
            service: {
                url: string;
                login: string;
                password: string;
            };
        };
        testOptions: {
            url: string;
        };
    };

    const config = getConfiguration<AppServiceApiConfig>();
    ```
