import { manifestResponse } from "../../../manifest-response";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  return manifestResponse({
    name: "WedBar Admin",
    short_name: "WedBar Admin",
    description: "Админка WedBar",
    start_url: `/admin/${slug}`,
    scope: `/admin/${slug}`,
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/wedbar-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/wedbar-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/wedbar-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  });
}
