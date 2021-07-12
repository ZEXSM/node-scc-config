# Configure your Node.js applications using Spring Cloud Config

[![Build Status](https://travis-ci.com/ZEXSM/node-scc-config.svg?branch=main)](https://travis-ci.com/ZEXSM/node-scc-config)
[![Download Status](https://img.shields.io/npm/dt/node-scc-config)](https://www.npmjs.com/package/node-scc-config)

## Benefits
* Server and client data decryption

## Installation
```shell
npm install node-scc-config
```
```shell
yarn add node-scc-config
```

## Usage

1. Create a client-side pointer to the Spring Cloud Config service
    ```ts
    const client = new SpringCloudConfigClient('your spring cloud config endpoint address...');
    ```

2. Configuring the client before calling
    ```ts
    client
        .beforeLoad(s => ({
            your request options...
        }))
    ```

3. Configuring the client after the call
    > Chipher marker defaults to '{cipher}'
* Chipher marker
    ```ts
    client
        .afterLoad(d => d
            .setChipherMarker('your chipher marker...')
    ```
* Data replacer by templates
    > Example: { ['{HOST}']: 'test', ['{SERVICE_NAME}']: 'app-service' }
    ```ts
    client
        .afterLoad(d => d
            .setReplacer('your template...')
    ```
* Data decryption
    * client
        ```ts
        client
            .afterLoad(d => d
                .setDecryptor(new AesDecryptor('your secret key or password...')))
        ```
    * server
        ```ts
        client
            .afterLoad(d => d
                .setDecryptor(new ServiceDecryptor('your decryption endpoint address...')))
        ```
* Source preparation 
    * Merge source
        > Default implementation if no function is specified
        ```ts
        client
            .afterLoad(d => d
                .setMergeSource<AppServiceApiConfig>((configuration?: TConfiguration<AppServiceApiConfig>) => {
                    your code to merge source...
                }))
        ```
    * Prepare source
        > Default implementation if no function is specified
        ```ts
        client
            .afterLoad(d => d
                .setPrepareSource<AppServiceApiConfig>((source: Record<string, any>) => {
                    your code to prepare source...
                }))
        ```
3. Call loading the configuration
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
