import { getExamplePageData } from "@/server/example";

export default async function HomePage() {
  const data = await getExamplePageData();

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <section className="max-w-md space-y-3 text-center">
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          App layer
        </p>
        <h1 className="text-3xl font-semibold text-zinc-950">{data.title}</h1>
        <p className="text-zinc-600">{data.description}</p>
      </section>
    </main>
  );
}
