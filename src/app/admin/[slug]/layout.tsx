import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AdminShell } from "./components/admin-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { manifest: `/admin/${slug}/manifest.webmanifest` };
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!process.env.ADMIN_SLUG || slug !== process.env.ADMIN_SLUG) {
    notFound();
  }

  return <AdminShell slug={slug}>{children}</AdminShell>;
}
