import { StorageHandler, StorageHandlerParams } from "./types.ts";
import { corsheaders, xmlheaders } from "./config.ts";
import {
  // formatMediaType,
  // getCharset,
  parseMediaType,
} from "std/media_types/mod.ts";

export const del: StorageHandler = (
  { storage, container, path }: StorageHandlerParams,
): Promise<Response> => storage.container(container).delete(path);

// $ curl http://127.0.0.1:8000/container/dir/file.json --netrc-file .netrc
// $ curl http://127.0.0.1:8000/container/dir/file.json -u "$user:$secret"
export const get: StorageHandler = async (
  { request, storage, container, path }: StorageHandlerParams,
): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const list = searchParams.has("list") || searchParams.get("comp") === "list";

  const response = list
    ? await storage.container(container).list(path)
    : await storage.container(container).get(path);

  const notFound = response.headers.get("x-ms-error-code") === "BlobNotFound"; // beware: unknown "directories" are not marked
  if (notFound) {
    return new Response(response.body, { status: 404, headers: xmlheaders });
  }
  if (list) {
    return new Response(response.body, { headers: xmlheaders });
  }
  return response;
  // @todo For text, json, xml: Append utf-8 as charset
  // Below code works, but sometimes crashes on formayMediaType
  // const [_mt, _charset] = parseMediaType(response.headers.get("content-type"));
  // const charset = _charset?.length > 0 ? _charset : getCharset(_mt);
  // const mediaType = formatMediaType(_mt, { charset });
  // const headers = new Headers(response.headers);
  // headers.set("content-type", mediaType);
  // return new Response(response.body, { headers });
};
export const options: StorageHandler = (
  //_params: StorageHandlerParams,
): Response =>
  new Response(undefined, {
    status: 204,
    headers: corsheaders,
  });

// $ curl -vXPUT http://127.0.0.1:8000/container/dir/file.json --netrc-file .netrc -d@f.json -H "content-type: application/json"
export const put: StorageHandler = async (
  { request, storage, container, path }: StorageHandlerParams,
): Promise<Response> => {
  const blob = await request.blob();
  if (blob.size === 0) {
    return new Response("Cannot PUT 0 bytes\n", { status: 400 });
  }
  const [mediaType] = parseMediaType(blob.type);
  return await storage.container(container).put(path, blob, mediaType);
};
