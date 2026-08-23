import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eval — NeurionForge | LLM Benchmark & Evaluation Platform",
  description:
    "We built the tests. Projected scores for frontier models we can't run at scale, measured scores for anything you run yourself — bring your own key or your own local model.",
  openGraph: {
    title: "Eval — NeurionForge | LLM Benchmark & Evaluation Platform",
    description:
      "Open, developer-first LLM benchmarking with transparent projected and measured scoring.",
    url: "https://eval.neurionforge.com",
    siteName: "NeurionForge Eval",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eval — NeurionForge",
    description: "LLM Benchmark & Evaluation Platform — projected & measured, transparent by default.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
