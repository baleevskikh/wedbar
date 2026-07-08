import { AdminShell } from "./components/admin-shell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <AdminShell slug={slug}>{children}</AdminShell>;
}
