import type { Metadata } from 'next';
import {
  LANDING_DESCRIPTION,
  LANDING_TITLE,
  LandingPage,
} from '@/features/landing/ui/landing-page';

export const metadata: Metadata = {
  title: LANDING_TITLE,
  description: LANDING_DESCRIPTION,
  openGraph: {
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function Home() {
  return <LandingPage />;
}
