import { notFound } from "next/navigation";

import { CartClient } from "./components/cart-client";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const table = Number((await searchParams).table);

  if (!Number.isInteger(table) || table <= 0) {
    notFound();
  }

  return <CartClient table={table} />;
}
