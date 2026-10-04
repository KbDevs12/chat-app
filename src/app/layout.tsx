import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "A modern real-time chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        ibmPlexMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full bg-paper text-ink font-sans">
        <main>{children}</main>
        <Toaster
          closeButton
          className="toaster group font-sans"
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton:
                "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
              cancelButton:
                "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
              closeButton:
                "group-[.toast]:bg-card group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:hover:bg-muted",
              error:
                "group-[.toast]:text-destructive group-[.toast]:border-destructive/30",
              success:
                "group-[.toast]:text-online group-[.toast]:border-online/30",
            },
          }}
        />
      </body>
    </html>
  );
}
