import { get, options } from "./storage_handlers.ts";
import { documentation } from "./documentation.ts";
import { CreateProxyOptions, StorageHandler } from "./types.ts";

export const safeHandlers = new Map<
  string,
  StorageHandler
>([
  ["GET", get],
  ["HEAD", get],
  ["OPTIONS", options],
]);

export const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
export const xmlheaders = { "content-type": "application/xml; charset=utf-8" };

export const corsheaders = new Headers([
  ["access-control-allow-origin", "*"],
  [
    "access-control-allow-methods",
    "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT",
  ],
]);
export const defaultSuffix = "core.windows.net";

export const buildConnectionString = (
  { account = "", key = "", suffix = defaultSuffix } = {},
): string =>
  `AccountName=${account};AccountKey=${key};EndpointSuffix=${suffix};DefaultEndpointsProtocol=https;`;

export const containerPattern = new URLPattern({
  pathname: "/:container([a-z][\\w-]+)/:path*",
});

const defaults = (env: Deno.Env): CreateProxyOptions => {
  const account = env.get("azure_account") ?? "";
  const key = env.get("azure_key") ?? "";

  const _cont = env.get("azure_containers");
  const containers = _cont && _cont.length > 4
    ? new Set<string>(JSON.parse(_cont))
    : new Set<string>();

  const suffix = env.get("azure_suffix") ?? defaultSuffix;

  const handlers = safeHandlers;

  const fallback = documentation({ account, containers, suffix, handlers });

  return {
    account,
    key,
    containers,
    suffix,
    handlers,
    fallback,
  };
};
export function config(options = {}): CreateProxyOptions {
  const defaultOptions = defaults(Deno.env);
  return { ...defaultOptions, ...options };
}
