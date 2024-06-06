import NextAuthProvider from "./NextAuthProvider";

export default function RootLayout({ children }) {
  return (
    <NextAuthProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </NextAuthProvider>
  );
}
