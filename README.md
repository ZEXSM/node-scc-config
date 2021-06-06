# Configure your Node.js applications using Spring Cloud Config

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
const client = new SpringCloudConfigClient('http://dev1/app-service-api/development');
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
* Client data decryption
```ts
    client
        .afterLoad(d => d
            .setChipherMarker('{cipher}')
            .setDecryptor(new AesDecryptor('password')))
```

* Server data decryption
```ts
    client
        .afterLoad(d => d
            .setChipherMarker('{cipher}')
            .setDecryptor(new ServiceDecryptor('http://dev1/decrypt')))
```
> Chipher marker defaults to '{cipher}'
3. Loading the configuration
```ts
    await client.load();
```

4. Using the loaded configuration
```ts
type AppServiceApiConfig = {
    block1: {
        url: string
    },
    block2: {
        url: string
    },
    block3: {
        appService: {
            url: string,
            userName: string,
            password: string
        };
    };
};


const config = getConfiguration<AppServiceApiConfig>();
```
