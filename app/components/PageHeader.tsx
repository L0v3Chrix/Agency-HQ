"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/clients", label: "Clients" },
    { href: "/agents", label: "Agents" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-amber-400">
          🎯 A.G.E HQ
        </Link>
        <div className="flex gap-6">
          {navLinks.map((link) => {
            const isActive = link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  isActive
                    ? "text-amber-400 font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
