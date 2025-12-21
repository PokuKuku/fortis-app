import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fortis Dashboard',
  description: 'Strength analytics dashboard for Fortis workout tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0a] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
