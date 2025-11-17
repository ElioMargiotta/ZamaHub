"use client";
import { Button } from '@/components/ui/button';
import { OnchainWallet } from '@/components/wallet/OnchainWallet';
import { LayoutDashboard, Gamepad2, Sparkles, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function AppNavBar() {
  const pathname = usePathname();

  return (
    <nav className="backdrop-blur-md shadow-soft relative z-20" style={{ backgroundColor: '#4D89B0', borderBottomColor: '#4D89B0' }}>
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          {/* Agora Logo in Navbar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/agora.png"
                alt="Agora Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              <Agora></Agora>
            </span>
          </div>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center space-x-1">
            <Button 
              variant={pathname === '/app' ? 'default' : 'ghost'} 
              size="sm"
              className={pathname === '/app' 
                ? 'shadow-soft' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
              }
              style={pathname === '/app' ? { backgroundColor: '#4D89B0', color: 'white' } : {}}
              disabled
            >
              <a href="/app" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </a>
            </Button>
            <Button 
              variant={pathname.startsWith('/app/zama-game') ? 'default' : 'ghost'} 
              size="sm"
              className={pathname.startsWith('/app/zama-game') 
                ? 'shadow-soft' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
              }
              style={pathname.startsWith('/app/zama-game') ? { backgroundColor: '#4D89B0', color: 'white' } : {}}
              asChild
            >
              <a href="/app/zama-game" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Zama Game
              </a>
            </Button>
            <Button 
              variant={pathname.startsWith('/app/spaces/ens') ? 'default' : 'ghost'} 
              size="sm"
              className={pathname.startsWith('/app/spaces/ens') 
                ? 'shadow-soft' 
                : 'text-white/80 hover:text-white hover:bg-white/10'
              }
              style={pathname.startsWith('/app/spaces/ens') ? { backgroundColor: '#4D89B0', color: 'white' } : {}}
              asChild
            >
              <a href="/app/spaces/ens" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Register ENS
              </a>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme toggle removed for simplified design */}
          </div>
          <OnchainWallet />
        </div>
      </div>
    </nav>
  );
}
