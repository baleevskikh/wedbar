import { notFound } from "next/navigation";

import { HomeClient } from "./components/home-client";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const table = Number((await searchParams).table);

  if (!Number.isInteger(table) || table <= 0) {
    notFound();
  }

  return <HomeClient table={table} />;
}
