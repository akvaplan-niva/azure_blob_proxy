import { createProxy } from "./mod.ts";
import { serve } from "std/http/server.ts";
if (import.meta.main) {
  serve(createProxy());
}
