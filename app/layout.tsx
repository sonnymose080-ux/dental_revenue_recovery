import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dental Revenue Recovery',
  description: 'Patient operations and revenue recovery workspace for dental clinics.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}