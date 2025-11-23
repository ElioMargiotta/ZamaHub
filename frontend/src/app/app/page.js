"use client";
import { useState, useEffect } from 'react';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

// Dashboard overview page - functional space management interface
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <UserDashboard />
      </div>
    </div>
  );
}
