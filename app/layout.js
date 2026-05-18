import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import SplashScreen from "@/components/SplashScreen";
import AIChatAssistant from "@/components/AIChatAssistant";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "NextCart | Premium E-Commerce Experience",
  description: "Discover a wide range of high-quality products with NextCart. Fast shipping, secure payments, and a seamless shopping experience.",
  keywords: "ecommerce, nextjs, shopping, online store, premium products",
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
              <AIChatAssistant />
            </AppContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
