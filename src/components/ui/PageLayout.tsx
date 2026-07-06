import type { ReactNode } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import MotionPage from '@/components/hud/MotionPage';

export default function PageLayout({
  children,
  maxWidth = 'max-w-5xl',
  className = '',
  particles = true,
  py = 'py-8 md:py-12',
}: {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
  particles?: boolean;
  py?: string;
}) {
  return (
    <div className={`min-h-screen relative page-shell ${className}`}>
      {particles && <ParticleBackground />}
      <MotionPage className={`relative z-10 container mx-auto px-4 md:px-6 ${py} ${maxWidth}`}>
        {children}
      </MotionPage>
    </div>
  );
}
