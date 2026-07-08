import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BartenderShell } from "./components/bartender-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { manifest: `/bartender/${slug}/manifest.webmanifest` };
}

export default async function BartenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!process.env.BARTENDER_SLUG || slug !== process.env.BARTENDER_SLUG) {
    notFound();
  }

  return <BartenderShell slug={slug}>{children}</BartenderShell>;
}
