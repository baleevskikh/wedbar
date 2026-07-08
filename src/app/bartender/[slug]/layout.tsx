import { BartenderShell } from "./components/bartender-shell";

export default async function BartenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <BartenderShell slug={slug}>{children}</BartenderShell>;
}
