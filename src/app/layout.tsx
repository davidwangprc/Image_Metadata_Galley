'use client';

import '@mantine/core/styles.css';
import './globals.css';
import { MantineProvider, createTheme } from '@mantine/core';
import styles from './layout.module.css';
import Navbar from '@/components/navbar/Navbar';
import { Search } from '@/components/Search/Search';

const theme = createTheme({
  components: {
    Button: {
      defaultProps: {
        variant: 'light',
      },
      styles: (theme) => ({
        root: {
          fontWeight: 'normal',
          backgroundColor: 'var(--card)',
          '&:hover': {
            backgroundColor: 'var(--background-light)',
          },
        }
      })
    },
    Text: {
      styles: {
        root: {
          color: 'inherit',
        }
      }
    },
    ScrollArea: {
      styles: {
        root: {
          height: '100%',
        }
      }
    }
  },
  // 使用自定义CSS变量
  colors: {
    dark: [
      'var(--background)',
      'var(--background-light)',
      'var(--card)',
      'var(--border)',
      'var(--muted)',
      'var(--muted-foreground)',
      'var(--foreground)',
      'var(--primary)',
      'var(--primary-hover)',
      'var(--accent)',
    ],
  }
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <div className={styles.root}>
            <header className={styles.header}>
              <Search />
            </header>
            <main className={styles.main}>
              <Navbar />
              {children}
            </main>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
