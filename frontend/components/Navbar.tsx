"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/archetypes", label: "Archetypes" },
  { href: "/market-value", label: "Market Value" },
  { href: "/tactical-fit", label: "Tactical Fit" },
  { href: "/shortlist", label: "Shortlist" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-14">
        <Link href="/" className="mr-4 flex items-center gap-2 text-emerald-400 font-bold text-lg">
          <span>⚽</span>
          <span className="hidden sm:inline">Soccer Dashboard</span>
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
