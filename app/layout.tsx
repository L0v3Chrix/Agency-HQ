import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Link from "next/link";

export const metadata = {
  title: "Agency HQ | Raize The Vibe",
  description: "Agency Command Center",
};

function NavBar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold text-amber-400">
          🎯 Agency HQ
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/clients" className="text-gray-300 hover:text-white transition-colors">
            Clients
          </Link>
          <Link href="/agents" className="text-gray-300 hover:text-white transition-colors">
            Agents
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <ConvexClientProvider>
          <NavBar />
          <main className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
