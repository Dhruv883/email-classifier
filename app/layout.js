import NextAuthProvider from "./NextAuthProvider";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <NextAuthProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </NextAuthProvider>
  );
}
