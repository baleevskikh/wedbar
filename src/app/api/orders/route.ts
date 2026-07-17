import { publish } from "@/lib/bus";
import { errorResponse, ValidationError } from "@/lib/errors";
import { createOrder, listActiveOrders } from "@/lib/repositories";
import { z } from "zod";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  clientRequestId: z.string().min(6).max(80),
  table: z.number().int().positive().max(999),
  comment: z.string().max(300).optional().default(""),
  items: z.array(z.object({ drinkId: z.string().min(1), qty: z.number().int().positive().max(20) })).min(1),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("active") === "1") {
    return Response.json(listActiveOrders(6));
  }

  return errorResponse(new ValidationError("Неподдерживаемый запрос"));
}

export async function POST(request: Request) {
  try {
    const body = createOrderSchema.parse(await request.json());
    const result = createOrder({
      ...body,
      comment: body.comment.trim(),
    });

    if (!result.order) {
      throw new ValidationError("Заказ не создан");
    }

    if (result.created) {
      publish("order.created", { orderId: result.order.id });
    }

    return Response.json({ order: result.order }, { status: result.created ? 201 : 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
