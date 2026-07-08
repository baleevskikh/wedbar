import { DrinkForm } from "../drink-form";

export default async function NewDrinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DrinkForm slug={slug} />;
}
