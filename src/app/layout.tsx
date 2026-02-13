import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- IMPORTANTE: Com chaves { } pois é um export nomeado ---
import { ThemeProvider } from "@/components/providers/theme-provider"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shineray Dashboard | Performance Comercial",
  description: "Monitoramento de vendas e metas em tempo real.",
  icons: {
    icon: "/logod.png",
    shortcut: "/logod.png",
    apple: "/logod.png",
  },
};

import { AuthProvider } from "@/contexts/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}