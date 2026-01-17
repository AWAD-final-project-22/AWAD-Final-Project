import AntdRegistry from '@/libs/AntdRegistry';
import StyledComponentsRegistry from '@/libs/StyledComponentsRegistry';
import { App } from 'antd';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryClientProviders from '@/libs/QueryClientProviders';
import StoreProvider from '@/libs/StoreProvider';
import GoogleAuthProvider from '@/libs/GoogleAuthProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Advanced Web Development Project',
  description: 'A graduation project by Team Alpha',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StoreProvider>
          <QueryClientProviders>
            <StyledComponentsRegistry>
              <AntdRegistry>
                <GoogleAuthProvider>
                  <App>{children}</App>
                </GoogleAuthProvider>
              </AntdRegistry>
            </StyledComponentsRegistry>
          </QueryClientProviders>
        </StoreProvider>
      </body>
    </html>
  );
}
