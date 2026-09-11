import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackIllinois Volunteer",
  description: "Self-service volunteer shift signup for HackIllinois.",
  openGraph: { type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen">
            <div className="glow-bg pointer-events-none fixed inset-0 -z-10" />
            <SiteHeader />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
