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
  title: "Notes & Reminders",
  description: "A simple notes and reminders application",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="root">{children}</div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    }, function(err) {
                      console.log('ServiceWorker registration failed');
                    });
                });

                // Listen for messages from the service worker
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data && event.data.command === 'CHECK_REMINDERS') {
                    // Trigger reminder check in the app
                    if (window.checkReminders) {
                      window.checkReminders();
                    }
                  }
                });
              }

              // Function to check reminders, made available globally
              window.checkReminders = function() {
                // In a real app, this would call your reminder checking function
                console.log('Checking reminders...');
              };
            `
          }}
        />
      </body>
    </html>
  );
}
