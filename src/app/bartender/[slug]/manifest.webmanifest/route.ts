export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  return Response.json({
    name: "WedBar Bartender",
    short_name: "Bar Panel",
    description: "Панель заказов WedBar",
    start_url: `/bartender/${slug}`,
    scope: `/bartender/${slug}`,
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  });
}
