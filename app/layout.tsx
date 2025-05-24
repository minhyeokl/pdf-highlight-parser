import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";



export const metadata: Metadata = {
  title: "PDF 하이라이트 추출기",
  description: "PDF 문서에서 하이라이트된 텍스트와 메모를 추출하여 Excel 파일로 저장하는 웹 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
