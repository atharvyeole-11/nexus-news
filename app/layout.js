import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LanguageDirectionWrapper } from "@/components/LanguageDirectionWrapper";
import { FloatingNav } from "@/components/FloatingNav";
import { ThemeProvider } from "@/lib/ThemeContext";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "Nexus News",
  description: "Dark newsroom — curated headlines, Nova AI assistant, your profile.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased pb-20 md:pb-24">
        <ThemeProvider>
          <Navbar />
          <main>
            <LanguageDirectionWrapper>{children}</LanguageDirectionWrapper>
          </main>
          <FloatingNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
