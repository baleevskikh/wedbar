import { publish } from "@/lib/bus";
import { errorResponse, NotFoundError } from "@/lib/errors";
import { getOrder, transitionOrder } from "@/lib/repositories";
import { z } from "zod";

export const runtime = "nodejs";

const patchSchema = z.object({
  action: z.enum(["accept", "ready", "reject"]),
  rejectReason: z.string().max(500).optional(),
  stopDrinkIds: z.array(z.string()).optional(),
});

function parseOrderId(rawId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new NotFoundError("Заказ не найден");
  }
  return id;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const order = getOrder(parseOrderId(rawId));
    if (!order) {
      return errorResponse(new NotFoundError("Заказ не найден"));
    }
    return Response.json({ order });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = parseOrderId(rawId);
    const body = patchSchema.parse(await request.json());
    const order = transitionOrder(id, body.action, {
      rejectReason: body.rejectReason,
      stopDrinkIds: body.stopDrinkIds,
    });
    publish("order.updated", { orderId: id });
    if (body.action === "reject" && body.stopDrinkIds?.length) {
      publish("menu.updated", { drinkIds: body.stopDrinkIds });
    }
    return Response.json({ order });
  } catch (error) {
    return errorResponse(error);
  }
}
