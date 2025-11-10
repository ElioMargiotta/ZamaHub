'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Settings,
  Wallet,
  Clock,
  Gamepad2,
  Shield
} from 'lucide-react';

const bottomNavItems = [
  {
    href: '/app',
    icon: LayoutDashboard,
    label: 'Dashboard',
    exactMatch: true,
    comingSoon: false,
  },
  {
    href: '/app/zama-game',
    icon: Gamepad2,
    label: 'Zama Game',
    exactMatch: false,
    comingSoon: false,
  },
  {
    href: '/app/kyc-register',
    icon: Shield,
    label: 'KYC',
    exactMatch: false,
    comingSoon: false,
  },
  {
    href: '/app/funding-comparison',
    icon: TrendingUp,
    label: 'Markets',
    exactMatch: false,
    comingSoon: false,
  },
  {
    href: '/app/portfolio',
    icon: Wallet,
    label: 'Portfolio',
    exactMatch: false,
    comingSoon: true,
  },
  {
    href: '/app/profile',
    icon: Users,
    label: 'Profile',
    exactMatch: false,
    comingSoon: true,
  },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const [showComingSoon, setShowComingSoon] = useState(null);

  const isActiveRoute = (item) => {
    if (item.exactMatch) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const handleComingSoonClick = (item, e) => {
    if (item.comingSoon) {
      e.preventDefault();
      setShowComingSoon(item.label);
      setTimeout(() => setShowComingSoon(null), 2000);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = isActiveRoute(item);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.comingSoon ? '#' : item.href}
                onClick={(e) => handleComingSoonClick(item, e)}
                className={cn(
                  'relative flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]', // 44px minimum touch target
                  'hover:bg-muted/50 active:scale-95',
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground',
                  item.comingSoon && 'opacity-60'
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    'h-5 w-5 mb-1',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  
                  {/* Coming Soon indicator */}
                  {item.comingSoon && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
                
                <span className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Coming Soon Toast */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-60 md:hidden"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-background/95 backdrop-blur-lg border border-border rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-4 w-4 text-orange-500" />
                </motion.div>
                <span className="text-sm font-medium">
                  {showComingSoon} Coming Soon!
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}