"use client";
import { useState, useEffect } from 'react';
import { SpaceBrowser } from '@/components/dashboard/SpaceBrowser';

export default function SpacesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <SpaceBrowser />
      </div>
    </div>
  );
}