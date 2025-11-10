'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  User,
  Settings,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  Wallet,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  {
    href: '/app/profile',
    icon: User,
    label: 'Profile',
    description: 'Manage your account',
    comingSoon: true
  },
  {
    href: '/app/portfolio',
    icon: Wallet,
    label: 'Portfolio',
    description: 'View your positions',
    comingSoon: true
  },
  {
    href: '/app/kyc-register',
    icon: ShieldCheck,
    label: 'KYC Register',
    description: 'Verify your identity',
    comingSoon: false
  },
  {
    href: '/app/funding-comparison',
    icon: TrendingUp,
    label: 'Markets',
    description: 'Funding rates',
    comingSoon: false
  },
  {
    href: '/app/settings',
    icon: Settings,
    label: 'Settings',
    description: 'App preferences',
    comingSoon: true
  },
  {
    href: '/docs',
    icon: FileText,
    label: 'Documentation',
    description: 'Help & guides',
    comingSoon: false
  },
  {
    href: '/legal',
    icon: Shield,
    label: 'Legal',
    description: 'Terms & privacy',
    comingSoon: false
  }
];

export function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(null);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleComingSoonClick = (item, e) => {
    if (item.comingSoon) {
      e.preventDefault();
      setShowComingSoon(item.label);
      setTimeout(() => setShowComingSoon(null), 2000);
    }
  };

  return (
    <>
      {/* Menu Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden min-h-[44px] min-w-[44px]"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed left-0 top-0 z-[101] h-full w-80 max-w-[85vw] bg-background/98 backdrop-blur-xl border-r border-border/50 shadow-2xl md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30 bg-background/90 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground drop-shadow-sm">Aequilibra</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="min-h-[44px] min-w-[44px] bg-background/50 hover:bg-background/80 border border-border/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 bg-background/80 backdrop-blur-lg">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.comingSoon ? '#' : item.href}
                      onClick={(e) => {
                        handleComingSoonClick(item, e);
                        if (!item.comingSoon) closeMenu();
                      }}
                      className={cn(
                        'relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[44px]',
                        'hover:bg-background/70 hover:backdrop-blur-xl active:scale-[0.98] border border-transparent',
                        isActive 
                          ? 'bg-primary/15 text-primary border-primary/30 shadow-lg backdrop-blur-xl' 
                          : 'text-foreground hover:text-foreground hover:border-border/30 bg-background/40 backdrop-blur-sm',
                        item.comingSoon && 'opacity-75'
                      )}
                    >
                      <div className="relative">
                        <Icon className={cn(
                          'h-5 w-5 flex-shrink-0 drop-shadow-sm',
                          isActive ? 'text-primary' : 'text-foreground'
                        )} />
                        
                        {/* Coming Soon indicator */}
                        {item.comingSoon && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full shadow-lg"
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
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold text-sm drop-shadow-sm',
                          isActive ? 'text-primary' : 'text-foreground'
                        )}>
                          {item.label}
                        </p>
                        <p className={cn(
                          'text-xs truncate drop-shadow-sm',
                          item.comingSoon ? 'text-orange-500 font-medium' : 'text-muted-foreground'
                        )}>
                          {item.comingSoon ? 'Coming Soon!' : item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border/30 space-y-3 bg-background/90 backdrop-blur-xl">
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border/20">
                  <span className="text-sm font-medium text-foreground drop-shadow-sm">Theme</span>
                  <ThemeToggle />
                </div>
                
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] bg-background/60 hover:bg-background/80 border-border/30 hover:border-border/50 backdrop-blur-sm"
                  onClick={closeMenu}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Toast for Side Menu */}
      <AnimatePresence>
        {showComingSoon && isOpen && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[102]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-background/98 backdrop-blur-xl border-2 border-border/50 rounded-xl px-6 py-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-5 w-5 text-orange-500" />
                </motion.div>
                <span className="text-base font-semibold text-foreground drop-shadow-sm">
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