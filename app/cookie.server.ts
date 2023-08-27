import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const cookie = createCookie("riseact", {
  maxAge: 604_800, // one week
});