import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import SplashScreen from "@/components/SplashScreen";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "NextCart - Vittal",
  description: "E-Commerce with Next.js ",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${outfit.className} antialiased text-gray-700 bg-white dark:bg-[#0a0a0a] dark:text-gray-200 transition-colors duration-300`} >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SplashScreen />
            <Toaster />
            <AppContextProvider>
              <div className="animate-fade-in-up">
                {children}
              </div>
            </AppContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
