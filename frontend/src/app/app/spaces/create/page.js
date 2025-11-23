"use client";
import { useState, useEffect } from 'react';
import { SpaceCreation } from '@/components/dashboard/SpaceCreation';

export default function SpacesCreationPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Create New Space</h1>
          <SpaceCreation />
        </div>
      </div>
    </div>
  );
}