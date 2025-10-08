/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

await start(manifest, config);
// main.ts
export default function handler(request: Request): Response {
  return new Response("Hello from Deno Deploy!", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
