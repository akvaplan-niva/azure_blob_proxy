export const notAllowedFactory = (methods: Set<string>) => (request: Request) =>
  new Response(
    `405 ${request.method} not allowed\nOnly: [${[...methods].join(",")}]`,
    { status: 405 },
  );

export const notConfigured = () =>
  new Response(
    "503 Service Unavailable\nAzure account or key is missing in config\n",
    { status: 503 },
  );

export const notImplemented = (request: Request) =>
  new Response(`501 ${request.method} not implemented\n`, { status: 501 });

export const unauthorizedContainer = () =>
  new Response("Unauthorized container\n", { status: 403 });
