"use client";
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';
import { CreateProposalDialog } from '@/components/dashboard/CreateProposalDialog';
import { SpacesTable } from '@/components/dashboard/SpacesTable';
import { useCategorizedSpaces } from '@/hooks/useSubgraph';

export default function MySpacesPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the centralized hook for all categorized spaces
  const { categorizedSpaces, loading, error } = useCategorizedSpaces(address, isConnected);

  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to view your spaces.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Spaces</h1>
              <p className="text-gray-600 mt-1">
                Manage your governance spaces and create proposals
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/app/spaces/create">
                <Button className="shadow-soft hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95" style={{ backgroundColor: '#4D89B0', color: 'white' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Space
                </Button>
              </Link>
            </div>
          </div>

          {/* Spaces Table */}
          <SpacesTable
            spaces={categorizedSpaces}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}