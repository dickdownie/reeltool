import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reel Tool",
  description: "Builds the right reel for a brief and learns from what happens after it is sent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
