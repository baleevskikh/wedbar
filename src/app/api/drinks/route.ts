import { publish } from "@/lib/bus";
import { errorResponse, ValidationError } from "@/lib/errors";
import { createDrink, listAllDrinks, listMenuDrinks } from "@/lib/repositories";
import { saveImage, saveVideo } from "@/lib/upload";

export const runtime = "nodejs";

function stringField(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "1";
  return Response.json({ drinks: all ? listAllDrinks() : listMenuDrinks() });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = stringField(form, "name");
    if (!name) {
      throw new ValidationError("Название обязательно");
    }

    const imageFile = form.get("image");
    const videoFile = form.get("video");
    const imagePath = await saveImage(imageFile instanceof File ? imageFile : null);
    if (!imagePath) {
      throw new ValidationError("Изображение обязательно");
    }

    const drink = createDrink({
      name,
      description: stringField(form, "description"),
      ingredients: stringField(form, "ingredients"),
      recipe: stringField(form, "recipe"),
      imagePath,
      videoPath: await saveVideo(videoFile instanceof File ? videoFile : null),
    });

    publish("menu.updated", { drinkId: drink.id });
    return Response.json({ drink }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
