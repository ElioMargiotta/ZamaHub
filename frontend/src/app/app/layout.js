import { AppHeader } from '@/components/app/AppHeader';
import { BottomNavBar } from '@/components/app/BottomNavBar';
import Image from 'next/image';

// dApp shell layout with navbar and bottom navigation
export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#fffefa' }}>
      {/* Agora Logo Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <Image
          src="/agora.png"
          alt="Agora Logo"
          fill
          className="object-contain object-center"
          priority
        />
      </div>

      {/* Subtle blue accent elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(240, 249, 255, 0.1)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(214, 235, 255, 0.08)' }}></div>
      </div>

      <div className="relative z-10">
        <AppHeader />
        <main className="flex-1 pb-20 md:pb-4">{children}</main>
        <BottomNavBar />
      </div>
    </div>
  );
}
