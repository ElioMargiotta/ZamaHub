"use client";
import { OnchainWallet } from '@/components/wallet/OnchainWallet';
import { LayoutDashboard, Users, Plus, Search, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export function AppHeader() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hideTimeout, setHideTimeout] = useState(null);

  // Define colors for consistency and clarity
  const colors = {
    primary: '#4D89B0', // Zama blue
    white: '#ffffff',
    black: '#000000',
    headerBg: '#4D89B0',
    hoverBg: 'rgba(255, 255, 255, 0.1)',
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/app',
      icon: LayoutDashboard,
      submenu: [
        { name: 'Overview', href: '/app', icon: Home },
        { name: 'Analytics', href: '/app/analytics', icon: LayoutDashboard },
      ]
    },
    {
      name: 'Spaces',
      href: '/app/spaces',
      icon: Users,
      submenu: [
        { name: 'My Spaces', href: '/app/spaces/my', icon: Users },
        { name: 'Create Space', href: '/app/spaces/create', icon: Plus },
        { name: 'Discover Spaces', href: '/app/spaces/discover', icon: Search },
      ]
    }
  ];

  const handleMouseEnter = (itemName) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredItem(null);
    }, 300); // 300ms delay before hiding
    setHideTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md shadow-lg" style={{ backgroundColor: colors.headerBg }}>
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative rounded-lg p-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <Image
                src="/agora.png"
                alt="Agora Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight" style={{ color: colors.white }}>
                ZamaHub
              </span>
              <span className="text-xs -mt-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Privacy-Preserving Apps
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 relative">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              <a
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 font-medium"
                style={{
                  color: colors.white,
                  backgroundColor: hoveredItem === item.name ? colors.hoverBg : 'transparent'
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </a>

              {/* Submenu */}
              {hoveredItem === item.name && (
                <div
                  className="absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95"
                  style={{ backgroundColor: colors.white, border: `1px solid ${colors.primary}20` }}
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="py-1">
                    {item.submenu.map((subItem) => (
                      <a
                        key={subItem.name}
                        href={subItem.href}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150"
                        style={{ color: colors.black }}
                      >
                        <subItem.icon className="h-4 w-4" style={{ color: colors.primary }} />
                        {subItem.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Wallet Connection */}
        <div className="flex items-center">
          <OnchainWallet />
        </div>
      </div>
    </header>
  );
}