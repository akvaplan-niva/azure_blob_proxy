import { CreateProxyOptions } from "./types.ts";
export const documentation =
  ({ account, containers, suffix, handlers }: CreateProxyOptions) =>
  (_request: Request): Response => {
    const methods = new Set(handlers.keys());

    const methodsList = [...methods].map((m) => `\n<li>${m}</li>`).join("");

    const containerList = [...containers].map((c) =>
      `\n<li><a href="/${c}?list">${c}</a></li>`
    ).join("");

    return new Response(
      `<!DOCTYPE html><html lang="en">
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body><h1>azure_blob_proxy</h1>
<dl>
  <dt>Account</dt>
  <dd>${account}</dd>
  <dt>Suffix</dt>
  <dd>${suffix}</dd>
  <dt>Methods</dt>
  <dd><ul>${methodsList}</ul></dd>
  <dt>Containers</dt>
  <dd><dd><ul>${containerList}</ul></dd>
</dl>
</body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  };
