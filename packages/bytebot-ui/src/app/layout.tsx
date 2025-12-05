import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clippy's Computer Classroom",
  description: "Learn to use computers with Clippy! Watch, practice, and get graded.",
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
    <html lang="en" suppressHydrationWarning>
      <body 
        className="antialiased"
        style={{ 
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          fontSize: '12px',
        }}
      >
        {children}
      </body>
    </html>
  );
}
