import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export const metadata = {
  title: "A.G.E HQ | Raize The Vibe",
  description: "Agency Command Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
