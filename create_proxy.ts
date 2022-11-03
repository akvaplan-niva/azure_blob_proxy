import { buildConnectionString, config, containerPattern } from "./config.ts";
import {
  notAllowedFactory,
  notConfigured,
  unauthorizedContainer,
} from "./errors.ts";

import { AzureStorage } from "azure_storage_client/storage.ts";
import { CreateProxyOptions } from "./types.ts";

export const createProxy =
  (options?: CreateProxyOptions) =>
  async (request: Request): Promise<Response> => {
    const {
      key,
      account,
      containers,
      auth,
      handlers,
      fallback,
      suffix,
    } = config(
      options,
    );

    if (!account) {
      return notConfigured();
    }

    const method = request.method.toUpperCase();
    const methods = new Set(handlers.keys());
    if (!methods.has(method)) {
      return notAllowedFactory(methods)(request);
    }

    const unauthorized = auth ? await auth(request) : undefined;
    if (unauthorized && unauthorized?.status >= 400) {
      return unauthorized;
    }

    const match = containerPattern.exec(request.url);

    if (match?.pathname) {
      const { container, path } = match.pathname.groups;

      if (containers && !containers.has(container)) {
        return unauthorizedContainer();
      }

      const handler = handlers.get(method);
      if (!handler) {
        return notAllowedFactory(methods)(request);
      }
      const storage = new AzureStorage(
        buildConnectionString({ account, key, suffix }),
      );
      return handler({ request, storage, container, path });
    }
    // No matching container, provide fallback or 405
    if (fallback) {
      return fallback(request);
    }
    return notAllowedFactory(methods)(request);
  };
