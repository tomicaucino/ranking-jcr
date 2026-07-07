import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const TABS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/players", label: "Jugadores" },
  { href: "/admin/rounds", label: "Fechas" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary-900">Administración</h1>
        <nav className="mt-3 flex gap-1 border-b border-border">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-t-lg px-3 py-2 text-sm font-medium text-muted hover:bg-primary-50 hover:text-primary-800"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
