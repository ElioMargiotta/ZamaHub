"use client";
import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';
import { SpacesTable } from '@/components/dashboard/SpacesTable';
import { useAllSpaces, useMemberCounts, useMemberSpaceIds, useAdminSpaceIds, useSpacesByOwner } from '@/hooks/useSubgraph';

function AllSpacesTable({ spaces, memberCounts, loading, error }) {
  const { address } = useAccount();

  // Get user's joined spaces (member, admin, owner)
  const { data: memberSpaceIds } = useMemberSpaceIds(address);
  const { data: adminSpaceIds } = useAdminSpaceIds(address);
  const { data: ownedSpaces } = useSpacesByOwner(address);

  // Combine all joined space IDs
  const joinedSpaceIds = useMemo(() => {
    const ids = new Set();
    
    // Add member spaces
    memberSpaceIds?.memberJoineds?.forEach(join => ids.add(join.spaceId));
    
    // Add admin spaces
    adminSpaceIds?.adminAddeds?.forEach(admin => ids.add(admin.spaceId));
    
    // Add owned spaces
    ownedSpaces?.spaces?.forEach(space => ids.add(space.spaceId));
    
    return Array.from(ids);
  }, [memberSpaceIds, adminSpaceIds, ownedSpaces]);

  // Transform spaces data to match the expected format for SpacesTable
  const transformedSpaces = useMemo(() => {
    if (!spaces) return { all: [] };

    // Add member counts and eligibility type to spaces
    const spacesWithCounts = spaces.map(space => ({
      ...space,
      memberCount: memberCounts?.[space.spaceId] || 0,
      eligibilityType: 'public', // Default eligibility type since it's not in subgraph yet
      // For all spaces, we don't have role information
      role: 'public'
    }));

    return { all: spacesWithCounts };
  }, [spaces, memberCounts]);

  return (
    <SpacesTable
      spaces={transformedSpaces}
      loading={loading}
      error={error}
      showFilters={true}
      title="All Spaces"
      showExpandable={false}
      showEligibilityType={true}
      userJoinedSpaces={joinedSpaceIds}
    />
  );
}

export default function SpacesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get all spaces from subgraph
  const { data: allSpacesData, isLoading: allSpacesLoading, error: allSpacesError } = useAllSpaces(1000, mounted);

  // Get member counts for all spaces
  const spaceIds = useMemo(() => 
    allSpacesData?.spaces?.map(space => space.spaceId) || [], 
    [allSpacesData]
  );
  const { data: memberCountsData } = useMemberCounts(spaceIds, mounted && spaceIds.length > 0);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Loading...
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#4D89B0]">Explore Spaces</h1>
              <p className="text-gray-700 mt-1">
                Discover and join governance spaces in the community
              </p>
            </div>
          </div>

          {/* Spaces Table */}
          <AllSpacesTable
            spaces={allSpacesData?.spaces}
            memberCounts={memberCountsData}
            loading={allSpacesLoading}
            error={allSpacesError}
          />
        </div>
      </div>
    </div>
  );
}