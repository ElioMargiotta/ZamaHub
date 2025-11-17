"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, toUtf8Bytes } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Calendar, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { CreateProposalDialog } from '@/components/dashboard/CreateProposalDialog';

// Import the SpaceRegistry ABI
import spaceRegistryAbi from '@/abis/SpaceRegistry.json';

// Contract address - this should be from environment or config
const SPACE_REGISTRY_ADDRESS = '0x7579FDF957567e2Eb881A0B00a7cF5772A59759b';

export default function SpacePage() {
  const params = useParams();
  const spaceName = params.space_name;
  const { address, isConnected } = useAccount();
  const [spaceData, setSpaceData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate spaceId from ENS name (keccak256 hash)
  const spaceId = spaceName ? keccak256(toUtf8Bytes(spaceName)) : null;

  // Read space data from contract
  const { data: spaceInfo, isLoading: spaceLoading } = useReadContract({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    functionName: 'getSpace',
    args: spaceId ? [spaceId] : undefined,
    enabled: !!spaceId,
  });

  // Check if current user is the owner
  const { data: ownerCheck } = useReadContract({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    functionName: 'isSpaceOwner',
    args: spaceId && address ? [spaceId, address] : undefined,
    enabled: !!spaceId && !!address,
  });

  // Watch for space events
  useWatchContractEvent({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    eventName: 'SpaceCreated',
    onLogs: (logs) => {
      // Handle space creation events
      logs.forEach((log) => {
        if (log.args.ensName === spaceName) {
          // Refresh space data
          window.location.reload();
        }
      });
    },
  });

  useWatchContractEvent({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    eventName: 'SpaceDisplayNameUpdated',
    onLogs: (logs) => {
      // Handle display name updates
      logs.forEach((log) => {
        if (log.args.spaceId === spaceId) {
          // Refresh space data
          window.location.reload();
        }
      });
    },
  });

  useEffect(() => {
    if (spaceInfo && !spaceLoading) {
      const [ensName, displayName, owner, createdAt, active] = spaceInfo;
      setSpaceData({
        ensName,
        displayName,
        owner,
        createdAt: new Date(Number(createdAt) * 1000),
        active,
      });
      setIsOwner(ownerCheck || false);
      setLoading(false);
    } else if (!spaceLoading) {
      setLoading(false);
    }
  }, [spaceInfo, spaceLoading, ownerCheck]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!spaceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Space &quot;{spaceName}&quot; not found or does not exist.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Space Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">{spaceData.displayName}</CardTitle>
                  <CardDescription className="text-lg">
                    {spaceData.ensName}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={spaceData.active ? "default" : "secondary"}>
                    {spaceData.active ? "Active" : "Inactive"}
                  </Badge>
                  {isOwner && (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Space
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Owner: {spaceData.owner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Created: {spaceData.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    ENS Verified ✓
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Space Content */}
          {isOwner ? (
            /* Owner View */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Space Management</CardTitle>
                  <CardDescription>
                    Manage your space settings and create governance proposals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CreateProposalDialog
                      spaceId={spaceData.spaceId}
                      spaceName={spaceData.displayName}
                    />
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Space Settings
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Manage Members
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Proposals</CardTitle>
                  <CardDescription>
                    Governance proposals created in this space.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">No proposals yet. Create your first proposal!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Public View */
            <Card>
              <CardHeader>
                <CardTitle>Space Overview</CardTitle>
                <CardDescription>
                  Learn about this governance space and its activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Space functionality coming soon. This space was created through the SpaceRegistry contract with ENS verification.
                  </p>
                  {!isConnected && (
                    <p className="text-sm text-gray-400 mt-2">
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
  );
}