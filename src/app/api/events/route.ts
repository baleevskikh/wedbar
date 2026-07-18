import { subscribe } from "@/lib/bus";

export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const closeConnection = () => {
        cleanup?.();
        if (heartbeat) {
          clearInterval(heartbeat);
        }
      };
      const enqueue = (message: string) => {
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          closeConnection();
        }
      };

      enqueue(": connected\n\n");
      cleanup = subscribe((type, payload) => {
        enqueue(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`);
      });
      heartbeat = setInterval(() => {
        enqueue(": heartbeat\n\n");
      }, 25000);
    },
    cancel() {
      cleanup?.();
      if (heartbeat) {
        clearInterval(heartbeat);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
