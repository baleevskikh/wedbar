import { notFound } from "next/navigation";

import { OrderClient } from "./order-client";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const table = Number((await searchParams).table);
  const { id } = await params;

  if (!Number.isInteger(table) || table <= 0) {
    notFound();
  }

  return <OrderClient orderId={id} table={table} />;
}
