"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Calendar, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { ProposalTable } from '@/components/dashboard/ProposalTable';
import { CreateProposalDialog } from '@/components/dashboard/CreateProposalDialog';
import Link from 'next/link';

// Import the SpaceRegistry ABI
import spaceRegistryAbi from '@/abis/SpaceRegistry.json';
import { useSpaceByEns, useAdminSpaceIds, useLatestDisplayNameUpdates, useProposalsBySpace, useMemberCounts } from '@/hooks/useSubgraph';

// Contract addresses from environment
const SPACE_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_SPACE_REGISTRY_ADDRESS;  export default function SpacePage() {
    const params = useParams();
    const spaceName = params.space_name;
    const { address, isConnected } = useAccount();
    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [manageMembersOpen, setManageMembersOpen] = useState(false);
    const [adminAddressInput, setAdminAddressInput] = useState('');
    const [newDisplayNameInput, setNewDisplayNameInput] = useState('');
    // Local optimistic override to show the updated display name immediately
    const [displayNameOverride, setDisplayNameOverride] = useState('');

  // Contract interaction (write)
  const { writeContract: writeContract, data: txHash, isPending: isTxPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Use centralized hooks for subgraph queries
  const { data, isLoading: loading, error } = useSpaceByEns(spaceName);
  const { data: adminSpaceIdsData, isLoading: adminSpaceIdsLoading, error: adminSpaceIdsError } = useAdminSpaceIds(address, isConnected);

  const spaceData = data?.spaces?.[0];

  const { data: proposalsData, isLoading: proposalsLoading, error: proposalsError } = useProposalsBySpace(spaceData?.spaceId, !!spaceData?.spaceId);

  // Query the latest display name update for this space
  const { data: displayNameUpdateData } = useLatestDisplayNameUpdates(spaceData?.spaceId ? [spaceData.spaceId] : []);

  // Query member count for this space
  const { data: memberCountsData } = useMemberCounts(spaceData?.spaceId ? [spaceData.spaceId] : [], !!spaceData?.spaceId);

  // Calculate member count from subgraph data
  const displayMemberCount = memberCountsData?.[spaceData?.spaceId] || 0;

  // Compute the current display name: prefer optimistic override, then latest event, then space data
  const currentDisplayName = displayNameOverride ||
    (displayNameUpdateData?.spaceDisplayNameUpdateds?.find(update => update.spaceId === spaceData?.spaceId)?.newDisplayName) ||
    spaceData?.displayName ||
    '';

  // Set isOwner and isAdmin when we have space data
  useEffect(() => {
    if (!spaceData) return;
    setIsOwner(spaceData.owner.toLowerCase() === address?.toLowerCase());
  }, [spaceData, address]);

  // Set isAdmin when we have both space data and admin event data
  useEffect(() => {
    if (!data?.spaces?.[0] || !adminSpaceIdsData?.adminAddeds) return;
    const spaceId = data.spaces[0].spaceId;
    const isAdminNow = adminSpaceIdsData.adminAddeds.some(a => a.spaceId === spaceId);
    setIsAdmin(isAdminNow);
  }, [data, adminSpaceIdsData]);

  // Set initial display name input when space data loads
  useEffect(() => {
    if (spaceData?.displayName && !newDisplayNameInput) {
      setNewDisplayNameInput(spaceData.displayName);
    }
  }, [spaceData, newDisplayNameInput]);

  // Handle joining space
  const handleJoinSpace = () => {
    if (!spaceData?.spaceId || !address) return;

    writeContract({
      address: SPACE_REGISTRY_ADDRESS,
      abi: spaceRegistryAbi.abi,
      functionName: 'joinSpace',
      args: [spaceData.spaceId],
    });
  };

  // Nominate (add) an admin
  const handleNominateAdmin = async () => {
    if (!adminAddressInput || !spaceData?.spaceId) return;
    writeContract({
      address: SPACE_REGISTRY_ADDRESS,
      abi: spaceRegistryAbi.abi,
      functionName: 'addSpaceAdmin',
      args: [spaceData.spaceId, adminAddressInput],
    });
  };

  // Revoke (remove) an admin
  const handleRevokeAdmin = async () => {
    if (!adminAddressInput || !spaceData?.spaceId) return;
    writeContract({
      address: SPACE_REGISTRY_ADDRESS,
      abi: spaceRegistryAbi.abi,
      functionName: 'removeSpaceAdmin',
      args: [spaceData.spaceId, adminAddressInput],
    });
  };

  // Update display name (owner or admin)
  const handleUpdateDisplayName = async () => {
    if (!newDisplayNameInput || !spaceData?.spaceId) return;
    writeContract({
      address: SPACE_REGISTRY_ADDRESS,
      abi: spaceRegistryAbi.abi,
      functionName: 'updateSpaceDisplayName',
      args: [spaceData.spaceId, newDisplayNameInput],
    });
  };

  // Query client for invalidation
  const queryClient = useQueryClient();

  // Refresh data after successful transaction — invalidate the space query and apply an optimistic override
  useEffect(() => {
    if (txSuccess) {
      // Invalidate the space query so fresh data is fetched from the subgraph
      queryClient.invalidateQueries(['spaceByEns', spaceName]);
      // Also invalidate the display name update query
      queryClient.invalidateQueries(['latestDisplayNameUpdate', spaceData?.spaceId]);
      // Invalidate member count query to refresh after join/leave operations
      queryClient.invalidateQueries(['memberCounts']);

      // Optimistically update the UI with the new display name while the subgraph indexes the change
      if (newDisplayNameInput) {
        setDisplayNameOverride(newDisplayNameInput);
      }
    }
  }, [txSuccess, queryClient, spaceName, spaceData?.spaceId, newDisplayNameInput]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4D89B0]" />
      </div>
    );
  }

  if (error || !spaceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="bg-white/80 border-[#E8DCC4]/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-black">
              Space &quot;{spaceName}&quot; not found or does not exist.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Space Header */}
          <Card className="bg-white/80 border-[#E8DCC4]/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl text-black">{currentDisplayName}</CardTitle>
                  <CardDescription className="text-lg text-black">
                    {spaceData.ensName}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={spaceData.isActive ? "default" : "secondary"} className={spaceData.isActive ? "bg-[#4D89B0] text-white" : ""}>
                    {spaceData.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {(isOwner || isAdmin) ? (
                    <>
                      {isOwner && (
                        <Button variant="outline" size="sm" onClick={() => setManageMembersOpen(true)} className="border-[#4D89B0] text-black hover:bg-[#4D89B0] hover:text-white">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Members
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="border-[#4D89B0] text-black hover:bg-[#4D89B0] hover:text-white">
                        <Settings className="h-4 w-4 mr-2" />
                        Space Settings
                      </Button>
                    </>
                  ) : isMember ? (
                    <Badge variant="outline" className="border-[#4D89B0] text-[#4D89B0]">Member</Badge>
                  ) : isConnected ? (
                    <Button
                      size="sm"
                      onClick={handleJoinSpace}
                      disabled={isTxPending || isConfirming}
                      className="bg-[#4D89B0] hover:bg-[#4D89B0]/90 text-white"
                    >
                      {isTxPending || isConfirming ? 'Joining...' : 'Join Space'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#4D89B0]/60" />
                  <span className="text-sm text-black">{displayMemberCount.toString()} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#4D89B0]/60" />
                  <span className="text-sm text-black">
                    Created: {new Date(Number(spaceData.createdAt) * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Space Content */}
          <div className="space-y-6">
            {/* Proposals Section - Visible to everyone */}
            <ProposalTable
              proposals={proposalsData?.proposalCreateds || []}
              loading={proposalsLoading}
              error={proposalsError}
              spaceName={spaceName}
              title="All Proposals"
            />

            {(isOwner || isAdmin) ? (
              /* Owner/Admin View */
              <>
                <Card className="bg-white/80 border-[#E8DCC4]/30">
                  <CardHeader>
                    <CardTitle className="text-black">Space Management</CardTitle>
                    <CardDescription className="text-black">
                      Manage your space settings and create governance proposals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <CreateProposalDialog
                        spaceId={spaceData.spaceId}
                        spaceName={currentDisplayName}
                      />
                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <Button variant="outline" className="flex items-center gap-2 border-[#4D89B0] text-black hover:bg-[#4D89B0] hover:text-white" onClick={() => setManageMembersOpen(true)}>
                            <Users className="h-4 w-4" />
                            Manage Members
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {manageMembersOpen && (
                  <Card className="bg-white/80 border-[#E8DCC4]/30">
                    <CardHeader>
                      <CardTitle className="text-black">Manage Members & Admins</CardTitle>
                      <CardDescription className="text-black">
                        Nominate or revoke admins for this space. Only the space owner can add/remove admins.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="0xAdminAddress"
                            value={adminAddressInput}
                            onChange={(e) => setAdminAddressInput(e.target.value)}
                            className="w-full md:w-2/3 border border-[#E8DCC4]/30 rounded px-3 py-2 bg-white/50"
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleNominateAdmin} disabled={isTxPending || isConfirming} className="bg-[#4D89B0] hover:bg-[#4D89B0]/90 text-white">Nominate Admin</Button>
                            <Button variant="ghost" onClick={handleRevokeAdmin} disabled={isTxPending || isConfirming} className="border-[#4D89B0] text-black hover:bg-[#4D89B0] hover:text-white">Revoke Admin</Button>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#E8DCC4]/30">
                          <p className="text-sm text-black mb-2">Update space display name</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter new display name"
                              value={newDisplayNameInput}
                              onChange={(e) => setNewDisplayNameInput(e.target.value)}
                              className="flex-1 border border-[#E8DCC4]/30 rounded px-3 py-2 bg-white/50"
                            />
                            <Button onClick={handleUpdateDisplayName} disabled={isTxPending || isConfirming || !spaceData || newDisplayNameInput === spaceData.displayName} className="bg-[#4D89B0] hover:bg-[#4D89B0]/90 text-white">Update</Button>
                          </div>
                        </div>

                        {writeError && (
                          <div className="text-sm text-red-600">{writeError.message}</div>
                        )}
                        {isTxPending && (
                          <div className="text-sm text-black">Transaction pending...</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              /* Public View */
              <Card className="bg-white/80 border-[#E8DCC4]/30">
                <CardHeader>
                  <CardTitle className="text-black">Space Overview</CardTitle>
                  <CardDescription className="text-black">
                    Learn about this governance space and its activities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-black">
                      Space functionality coming soon. This space was created through the SpaceRegistry contract with ENS verification.
                    </p>
                    {!isConnected && (
                      <p className="text-sm text-black mt-2">
                        Connect your wallet to interact with this space.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}