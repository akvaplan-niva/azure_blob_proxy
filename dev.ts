import { createAzureBlobProxy } from "./mod.ts";
if (import.meta.main) {
  Deno.serve(createAzureBlobProxy());
}
