// A RESTful text file API example
// $ deno run --allow-net --allow-env text.ts
import {
  config,
  createProxy,
  del,
  put,
  StorageHandler,
  StorageHandlerParams,
} from "azure_blob_proxy/mod.ts";

import { serve } from "std/http/server.ts";

//$ curl -vXPOST --netrc-file .netrc --data-binary @text.txt -H "content-type: text/plain" http://localhost:8000/container
export const postText: StorageHandler = async (
  { request, storage, container }: StorageHandlerParams,
): Promise<Response> => {
  if (/^text\//i.test(request.headers.get("content-type") ?? "")) {
    const path = `text/${crypto.randomUUID()}.txt`;
    const r: Response = await put({ request, storage, container, path });
    if (!r.ok) {
      return r;
    }
    const { headers, body, ...rest } = r;
    const locationHeaders = new Headers(headers);
    const location = new URL(
      `/${container}${path ? `/${path}` : ""}`,
      request.url,
    );
    locationHeaders.set("location", location.href);
    return new Response(body, { headers: locationHeaders, ...rest });
  }
  return new Response("400 Bad Request\nPOST body must be text", {
    status: 400,
  });
};

if (import.meta.main) {
  const { handlers } = config(); // Get default config
  handlers.set("POST", postText); // Add POST handler
  handlers.set("PUT", put); // Add (generic) PUT handler
  handlers.set("DELETE", del); // Add (generic) DELETE handler
  serve(createProxy(config({ handlers })));
}
