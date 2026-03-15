import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meeter - מערכת שיבוץ מורים",
  description: "מערכת שיבוץ מורים ללמידה מרחוק",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
