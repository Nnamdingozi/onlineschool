import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Image from "next/image";
import { Providers } from './provider';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "class Bridge",
  description: "An online school based on Nigeria school curriculum",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
             <Image height={60} width={140} src={'/images/logo1.png'} alt="site logo" className="rounded"></Image>
          
              <div className="flex gap-5 items-center font-semibold">
                {/* <Link href={"/"}>ClassBridge</Link> */}
                <div className="flex items-center gap-2">
                </div>

              </div>
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
            <div className="flex items-center">
              <ThemeSwitcher />
            </div>
          </nav>
          {children}
          <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
            <p>
              Powered by{" "}
              <a
                href="https://nnamdingozi.github.io/my-portfolio/"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
              >
                Richambition
              </a>
            </p>

          </footer>
          </Providers >
        </ThemeProvider>
      </body>
    </html>
  );
}
