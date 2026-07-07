"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/types";

const LINKS = [
  { href: "/ranking", label: "Ranking" },
  { href: "/rounds", label: "Fechas" },
  { href: "/medal-play", label: "Medal Play" },
];

export function NavBar({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = role === "admin" ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-primary-700 text-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/ranking" className="flex items-center gap-2 font-serif text-lg font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-400" />
          JCR &middot; Match Play
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} active={pathname.startsWith(link.href)}>
              {link.label}
            </NavLink>
          ))}
          <form action={signOut}>
            <button
              type="submit"
              className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white"
            >
              <LogOut size={16} /> Salir
            </button>
          </form>
        </nav>

        <button
          className="p-2 sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-primary-600 px-4 py-3 sm:hidden">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} active={pathname.startsWith(link.href)} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <form action={signOut}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white"
            >
              <LogOut size={16} /> Salir
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white",
        active && "bg-primary-800 text-white"
      )}
    >
      {children}
    </Link>
  );
}
