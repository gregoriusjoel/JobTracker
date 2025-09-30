import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Tracker - Kelola Aplikasi Pekerjaan Anda",
  description: "Aplikasi untuk melacak dan mengelola aplikasi pekerjaan Anda dengan mudah",
  icons: {
    icon: '/JT.png',
    shortcut: '/JT.png',
    apple: '/JT.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              className="z-50"
              theme="colored"
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
