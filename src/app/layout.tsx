import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/shared/lib/cn';
import { Toaster } from '@/components/ui/sonner';
import Header from './_components/header';
import { QueryProvider } from './query-provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Frontend Starter Platform',
  description: 'AI와 함께하는 재사용 가능한 프론트엔드 기반',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={cn('font-sans', geist.variable)}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <QueryProvider>
            <Header />
            <div className="pt-14">{children}</div>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
