//C:\codemind1\client\app\layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeMind.AI - Intelligent IDE",
  description: "A VS Code-like IDE with integrated AI assistance powered by Ollama",
};

<<<<<<< HEAD
import { ThemeProvider } from "@/contexts/ThemeContext";

=======
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
<<<<<<< HEAD
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1e1e1e] text-[#cccccc]`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
=======
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0d1117] text-[#e6edf3]`}
      >
        {children}
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      </body>
    </html>
  );
}
