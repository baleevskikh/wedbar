import { getUploadsDir } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const relativePath = params.path.join("/");
  const uploadsDir = getUploadsDir();
  const filePath = path.resolve(uploadsDir, relativePath);

  if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) {
    return new Response("Not found", { status: 404 });
  }

  if (!fs.existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const type = contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
  const range = request.headers.get("range");
  const headers = {
    "Content-Type": type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };

  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : stat.size - 1;
      if (start >= stat.size || end >= stat.size || start > end) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${stat.size}` },
        });
      }

      return new Response(fs.createReadStream(filePath, { start, end }) as unknown as BodyInit, {
        status: 206,
        headers: {
          ...headers,
          "Content-Length": String(end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        },
      });
    }
  }

  return new Response(fs.createReadStream(filePath) as unknown as BodyInit, {
    headers: {
      ...headers,
      "Content-Length": String(stat.size),
    },
  });
}
