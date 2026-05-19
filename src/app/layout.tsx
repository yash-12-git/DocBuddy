import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/cart/CartDrawer';
import './globals.css';

export const metadata: Metadata = {
  title: 'DoctorHub — Find & Book Doctors Near You',
  description:
    'Book appointments with verified doctors near you. Search by specialty, check availability, and book in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
