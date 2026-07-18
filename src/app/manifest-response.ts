export function manifestResponse(manifest: Record<string, unknown>) {
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
    },
  });
}
