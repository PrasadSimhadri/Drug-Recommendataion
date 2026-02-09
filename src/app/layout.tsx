import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drug Recommendation System",
  description: "Graph Based Drug Recommendation System - Integrating Clinical and Biomedical Knowledge Graphs using Neo4j",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
