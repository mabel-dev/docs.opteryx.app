import "./globals.css";
import React from "react";

export const metadata = {
  title: "Opteryx Documentation",
  description: "Official documentation for Opteryx — SQL engine for data files",
  icons: {
    icon: "/opteryx-icon.svg",
    apple: "/opteryx-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
