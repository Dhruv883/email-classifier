import Navbar from "@/components/Navbar";
import NextAuthProvider from "./NextAuthProvider";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <NextAuthProvider>
      <html lang="en">
        <body className="h-screen overflow-hidden font-notoSans">
          <Navbar />
          {children}
        </body>
      </html>
    </NextAuthProvider>
  );
}
