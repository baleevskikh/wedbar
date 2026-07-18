import { publish } from "@/lib/bus";
import { errorResponse, NotFoundError, ValidationError } from "@/lib/errors";
import { getDrink, moveDrink, softDeleteDrink, updateDrink } from "@/lib/repositories";
import { requireAnyStaffToken, requireStaffToken } from "@/lib/staff-auth";
import { saveImage, saveVideo } from "@/lib/upload";

export const runtime = "nodejs";

function stringField(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const drink = getDrink(id);
  if (!drink || drink.isDeleted) {
    return errorResponse(new NotFoundError("Напиток не найден"));
  }
  return Response.json({ drink });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      requireStaffToken(request, "admin");
      const current = getDrink(id);
      if (!current || current.isDeleted) {
        throw new NotFoundError("Напиток не найден");
      }
      const form = await request.formData();
      const imageFile = form.get("image");
      const videoFile = form.get("video");
      const imagePath = await saveImage(imageFile instanceof File ? imageFile : null);
      const videoPath = await saveVideo(videoFile instanceof File ? videoFile : null);
      const drink = updateDrink(id, {
        name: stringField(form, "name"),
        description: stringField(form, "description"),
        ingredients: stringField(form, "ingredients"),
        recipe: stringField(form, "recipe"),
        imagePath: imagePath ?? current.imagePath,
        videoPath: videoPath ?? current.videoPath,
      });
      publish("menu.updated", { drinkId: id });
      return Response.json({ drink });
    }

    const body = (await request.json()) as {
      isStopped?: boolean;
      move?: "up" | "down";
    };

    if (body.move) {
      requireStaffToken(request, "admin");
      const drink = moveDrink(id, body.move);
      publish("menu.updated", { drinkId: id });
      return Response.json({ drink });
    }

    if (typeof body.isStopped === "boolean") {
      requireAnyStaffToken(request);
      const drink = updateDrink(id, { isStopped: body.isStopped });
      publish("menu.updated", { drinkId: id });
      return Response.json({ drink });
    }

    throw new ValidationError("Нет изменений");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireStaffToken(_request, "admin");
    const { id } = await context.params;
    softDeleteDrink(id);
    publish("menu.updated", { drinkId: id });
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
