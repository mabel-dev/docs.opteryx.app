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
      <body>
        {children}
        {/* Hydrates the "Try it live" cards on the API reference pages. Must be
            loaded here: markdown is injected with dangerouslySetInnerHTML, and
            script tags inside that HTML are never executed by the browser. */}
        <script defer src="/api-tryit.js" />
      </body>
    </html>
  );
}
