import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import Navigation from "@/components/Navigation";
import GoogleAdsScript from "@/components/GoogleAdsScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Analyist Art | AI ",
  description: "그림으로 아이 마음을 천천히 이해합니다",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          {children}
          <GoogleAdsScript />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
