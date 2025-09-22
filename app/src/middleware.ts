import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, redirect } = context;
  const url = new URL(request.url);

  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.replace(/^www\./, "");
    return redirect(url.toString(), 301);
  }

  return next();
};
