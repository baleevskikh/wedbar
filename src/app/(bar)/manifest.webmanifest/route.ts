import { manifestResponse } from "../../manifest-response";

export function GET() {
  return manifestResponse({
    name: "WedBar",
    short_name: "WedBar",
    description: "Заказ коктейлей для гостей",
    start_url: "/?table=1",
    scope: "/",
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
