"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Bell, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200"
    >
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <Image
          src="/Agora.png"
          alt="Agora Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <h1 className="text-2xl font-bold" style={{ color: '#4D89B0' }}>
          Agora
        </h1>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        <a href="/app" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
          Dashboard
        </a>
        <a href="/spaces" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
          Spaces
        </a>
        <a href="/proposals" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
          Proposals
        </a>
        <a href="/activity" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
          Activity
        </a>
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-100">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-100">
          <Settings className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <Button variant="ghost" size="sm" className="md:hidden text-gray-600 hover:text-black hover:bg-gray-100">
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}