"use client";
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { OnchainWallet } from '@/components/wallet/OnchainWallet';
import { LayoutDashboard, Gamepad2, Sparkles, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AppNavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <a className="flex items-center space-x-2" href="/">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              ZamaHub
            </span>
          </a>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant={pathname === '/app' ? 'default' : 'ghost'} 
              size="sm"
              asChild
            >
              <a href="/app" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </a>
            </Button>
            <Button 
              variant={pathname.startsWith('/app/zama-game') ? 'default' : 'ghost'} 
              size="sm"
              asChild
            >
              <a href="/app/zama-game" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Zama Game
              </a>
            </Button>
            <Button 
              variant={pathname.startsWith('/app/kyc-register') ? 'default' : 'ghost'} 
              size="sm"
              asChild
            >
              <a href="/app/kyc-register" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                KYC Register
              </a>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
          </div>
          <OnchainWallet />
        </div>
      </div>
    </nav>
  );
}
