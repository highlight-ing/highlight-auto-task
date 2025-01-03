import { Inter } from "next/font/google";
import { cn } from '@/lib/utils';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { NameProvider } from "@/components/providers/NameProvider"
import { RemindersProvider } from "@/components/providers/RemindersProvider"

const inter = Inter({ subsets: ["latin"] });

const fontHeading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        'antialiased',
        fontHeading.variable,
        fontBody.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NameProvider>
            <RemindersProvider>
              {children}
            </RemindersProvider>
          </NameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
