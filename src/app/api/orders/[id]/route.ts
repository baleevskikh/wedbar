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

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = getOrder(id);
  if (!order) {
    return errorResponse(new NotFoundError("Заказ не найден"));
  }
  return Response.json({ order });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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
