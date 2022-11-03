# azure_blob_proxy

Azure blob storage proxy for [Deno](https://deno.land) (Deploy)

## Use

Start a basic, safe proxy:

```js
import { createProxy } from "https://deno.land/x/azure_blob_proxy@0.1.1";
Deno.serve(createProxy());
```

Above code will require setting env variables `azure_account` and `azure_key`.

## Dev

Start a dev server

```sh
deno task dev
```

## DELETE and PUT

By default, only safe HTTP methods (`GET`, `HEAD`, and `OPTIONS`) are
operational.

Add support for `DELETE` and `PUT`:

```js
import { config, createProxy, del, put } from "azure_blob_proxy/mod.ts";

const { handlers } = config(); // Get default handlers map
handlers.set("PUT", put); // Add (generic) PUT handler
handlers.set("DELETE", del); // Add (generic) DELETE handler
Deno.serve(createProxy(config({ handlers }))); // Inject updated handlers
```

## Auth

Bring your own authorization handler (that must return `401`/`403` or
`undefined`):

```js
import { users, authHandler } from "…";

Deno.serve(createProxy({
  auth: async (request) => await authHandler(request, users)
});
```

## Adding a POST handler

Using `POST` to create new blobs requires writing a POST storage handler.

The POST handler must build a path from the request Essentially could be as easy
as providing the default [PUT](./storage_handlers.ts#put) handler with a `path`:

and should return a `location` response header with the fresh new resource.

```ts
import { put } from "azure_blob_proxy/storage_handlers.ts";

const { handlers } = config();
handlers.set(
  "POST",
  ({ request, storage, container, path }) =>
    put({ request, storage, container, path: `text/${crypto.randomUUID()}` }),
); // Add POST handler
Deno.serve(createProxy(config({ handlers })));
```

See [text.ts](./text.ts) for a fully working production ready example.

## Config

Use `env` variables for basic configuration, extends with a
`AzureBlobProxyOptions` config object.

### env variables

```sh
azure_account=""    # Account name
azure_key=""        # Account key (or shared access signature)
azure_containers="" # Optional. Comma-separated list of allowed containers
```

### config object

```js
const options = {};
createAzureBlobProxy(config(options));
```

Available options:

```ts
export type AzureBlobProxyOptions = {
  account: string; // Azure storage account name
  key?: string; // Azure account key
  containers: Set<string>; // Allowed containers
  suffix: string; // Azure URL suffix
  handlers: Map<string, StorageHandler>; // HTTP method handlers
  fallback?: Handler; // Fallback request handler
  auth?: Handler; // Brin your own authorization request handler
};
```

## Dependencies

See [imports.json][imports], but shootout to
[itte1/azure_storage_client][azure_storage_client]

[azure_storage_client]: https://github.com/itte1/azure_storage_client
[imports]: ./imports.json
