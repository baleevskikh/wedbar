import { notFound } from "next/navigation";

import { getDrink } from "@/lib/repositories";
import { DrinkForm } from "../drink-form";

export default async function EditDrinkPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const drink = getDrink(id);

  if (!drink || drink.isDeleted) {
    notFound();
  }

  return <DrinkForm drink={drink} slug={slug} />;
}
