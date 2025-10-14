import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Footer } from '@/components/Footer';
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
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} antialiased transition-colors duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('job-tracker-theme');
                  const theme = savedTheme || 'light'; // Default to light theme
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
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
