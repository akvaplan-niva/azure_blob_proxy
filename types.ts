import { AzureStorage } from "azure_storage_client/storage.ts";
export type CreateProxyOptions = {
  account: string; // Azure storage account name
  key?: string; // Azure account key
  containers: Set<string>; // Allowed containers
  suffix: string; // Azure URL suffix
  handlers: Map<string, StorageHandler>; // HTTP method handlers
  fallback?: Handler; // Fallback request handler
  auth?: Handler; // BYO authorization request handler
};
export type Handler = (request: Request) => Response | Promise<Response>;

export type StorageHandlerParams = {
  account?: string;
  key?: string;
  suffix?: string;
  request: Request;
  storage: AzureStorage;
  container: string;
  path: string;
};

export type ResponseType = Promise<Response> | Response;

export type StorageHandler = (
  params: StorageHandlerParams,
) => Response | Promise<Response>;
