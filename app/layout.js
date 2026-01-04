import { Outfit, Poppins } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { Suspense } from "react";
import { AuthProvider } from "./context/AuthContext"; // ✅ if you're using Vercel Speed Insights
import { DateProvider } from "./context/DateContext";
import { ThemeProvider } from "next-themes";
import { ThemeClientWrapper } from "@/components/ThemeClientWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "400",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Gam oil Dashboard",
  description: "Where You manage your trucks and trips",
};

export default function RootLayout({ children }) {
  // Always set color-scheme and className on <html> for SSR/CSR match
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body
        className={`${outfit.variable} ${poppins.variable} antialiased font-outfit`}
      >
        <Toaster position="top-center" theme="dark" richColors closeButton />
        {/* ThemeProvider and ThemeClientWrapper should be client components */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DateProvider>
              <Suspense fallback={null}>
                <ThemeClientWrapper>{children}</ThemeClientWrapper>
              </Suspense>
            </DateProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
