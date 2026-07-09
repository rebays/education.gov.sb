import type { Metadata } from "next";
import { Baskervville, Source_Sans_3, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});


/* Classic theme faces */
const baskervville = Baskervville({
  variable: "--font-baskervville",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "education.gov.sb | Ministry of Education & Human Resources Development",
    template: "%s | education.gov.sb",
  },
  description:
    "The central hub for documents, reports, videos, and public information from the Solomon Islands Ministry of Education and Human Resources Development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="classic"
      className={cn("h-full", "antialiased", sourceSans.variable, baskervville.variable, "font-sans", figtree.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
