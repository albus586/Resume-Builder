import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
// Import reset CSS first before any other styles
import "../styles/color-reset.css";
import "./fallback.css";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "Your go-to app for building resumes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload the patch script for faster execution */}
        <link rel="preload" href="/patch.js" as="script" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="css-oklab-fix"
          dangerouslySetInnerHTML={{
            __html: `
              // Block all oklab and oklch color functions
              try {
                if (window.CSS) {
                  const originalParse = window.CSS.parse || (() => {});
                  window.CSS.parse = function() {
                    const args = Array.from(arguments);
                    if (args.some(arg => typeof arg === 'string' && (arg.includes('oklab') || arg.includes('oklch')))) {
                      throw new Error('Color function disabled');
                    }
                    return originalParse.apply(this, args);
                  };
                  
                  // Force disable color function support
                  window.CSS.supports = function(prop, value) {
                    if (arguments.length === 1) {
                      if (typeof prop === 'string' && (prop.includes('oklab') || prop.includes('oklch'))) {
                        return false;
                      }
                    } else if (arguments.length === 2) {
                      if ((typeof value === 'string') && (value.includes('oklab') || value.includes('oklch'))) {
                        return false;
                      }
                    }
                    return true;
                  };
                }
                
                // Add emergency style fix
                const style = document.createElement('style');
                style.textContent = \`
                  * { 
                    --tw-text-opacity: 1 !important;
                    --tw-bg-opacity: 1 !important;
                    --tw-border-opacity: 1 !important;
                    --tw-ring-opacity: 1 !important;
                  }
                \`;
                document.head.appendChild(style);
              } catch (e) {
                console.warn('CSS patch error:', e);
              }
            `,
          }}
          strategy="beforeInteractive"
        />
        <Toaster richColors />
        {children}
        <Script src="/patch.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
