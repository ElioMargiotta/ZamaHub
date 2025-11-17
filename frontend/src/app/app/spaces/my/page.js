"use client";
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Settings, Plus, Users, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { CreateProposalDialog } from '@/components/dashboard/CreateProposalDialog';
import { ethers } from 'ethers';

// Import the SpaceRegistry ABI
import spaceRegistryAbi from '@/abis/SpaceRegistry.json';

// Contract address - this should be from environment or config
const SPACE_REGISTRY_ADDRESS = '0x7579FDF957567e2Eb881A0B00a7cF5772A59759b';

export default function MySpacesPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [ownedSpaces, setOwnedSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user's owned spaces
  const { data: userSpaces, isLoading: userSpacesLoading, refetch } = useReadContract({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    functionName: 'getOwnerSpaces',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  });

  // Debug logging
  useEffect(() => {
    console.log('MySpacesPage Debug:');
    console.log('address:', address);
    console.log('isConnected:', isConnected);
    console.log('userSpaces:', userSpaces);
    console.log('userSpacesLoading:', userSpacesLoading);
    console.log('ownedSpaces:', ownedSpaces);
  }, [address, isConnected, userSpaces, userSpacesLoading, ownedSpaces]);

  // Function to fetch SpaceCreated events
  const fetchSpaceEvents = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org');
      const contract = new ethers.Contract(SPACE_REGISTRY_ADDRESS, spaceRegistryAbi.abi, provider);

      // Get current block
      const currentBlock = await provider.getBlockNumber();
      console.log('Current block:', currentBlock);

      // Fetch SpaceCreated events from the last 10000 blocks
      const fromBlock = Math.max(0, currentBlock - 10000);
      const filter = contract.filters.SpaceCreated();
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);

      console.log('SpaceCreated events found:', events.length);
      events.forEach((event, index) => {
        console.log(`Event ${index}:`, {
          spaceId: event.args.spaceId,
          ensName: event.args.ensName,
          displayName: event.args.displayName,
          owner: event.args.owner,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      return events;
    } catch (error) {
      console.error('Error fetching space events:', error);
      return [];
    }
  };

  // Watch for space events to refresh data
  useWatchContractEvent({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    eventName: 'SpaceCreated',
    onLogs: () => refetch(),
  });

  useWatchContractEvent({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    eventName: 'SpaceDisplayNameUpdated',
    onLogs: () => refetch(),
  });

  useWatchContractEvent({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    eventName: 'SpaceDeactivated',
    onLogs: () => refetch(),
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userSpaces && !userSpacesLoading) {
      const fetchSpaceDetails = async () => {
        const spaces = [];
        try {
          const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org');
          const contract = new ethers.Contract(SPACE_REGISTRY_ADDRESS, spaceRegistryAbi.abi, provider);

          for (const spaceId of userSpaces) {
            try {
              // Fetch space details from contract
              const spaceData = await contract.getSpace(spaceId);
              const [ensName, displayName, owner, createdAt] = spaceData;

              spaces.push({
                spaceId,
                ensName,
                displayName,
                owner,
                createdAt: new Date(Number(createdAt) * 1000), // Convert from seconds to milliseconds
                memberCount: Math.floor(Math.random() * 100) + 10, // Placeholder
                proposalCount: Math.floor(Math.random() * 20), // Placeholder
              });
            } catch (error) {
              console.error('Error fetching space details from contract:', error);
              // Fallback to basic data
              spaces.push({
                spaceId,
                ensName: `space${spaces.length + 1}.eth`,
                displayName: `Space ${spaces.length + 1}`,
                owner: address,
                createdAt: new Date(),
                memberCount: Math.floor(Math.random() * 100) + 10,
                proposalCount: Math.floor(Math.random() * 20),
              });
            }
          }
        } catch (error) {
          console.error('Error setting up contract:', error);
        }

        setOwnedSpaces(spaces);
        setLoading(false);
      };

      fetchSpaceDetails();
    } else if (!userSpacesLoading) {
      setLoading(false);
    }
  }, [userSpaces, userSpacesLoading, address]);

  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
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
              <Button
                variant="outline"
                onClick={fetchSpaceEvents}
                className="text-xs"
              >
                Debug Events
              </Button>
              <Link href="/app/spaces/create">
                <Button className="shadow-soft" style={{ backgroundColor: '#4D89B0', color: 'white' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Space
                </Button>
              </Link>
            </div>
          </div>

          {/* Spaces Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading your spaces...</span>
            </div>
          ) : ownedSpaces.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No spaces yet</h3>
                  <p>You haven&apos;t created any governance spaces yet.</p>
                </div>
                <Link href="/app/spaces/create">
                  <Button style={{ backgroundColor: '#4D89B0', color: 'white' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Space
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedSpaces.map((space) => (
                <Card key={space.spaceId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{space.displayName}</CardTitle>
                        <CardDescription className="text-sm">{space.ensName}</CardDescription>
                        <CardDescription className="text-xs text-gray-400 font-mono">
                          {space.spaceId}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Owner</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{space.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{space.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{space.proposalCount} proposals</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={space.active ? "default" : "secondary"}>
                        {space.active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Created {space.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/app/spaces/${space.ensName.replace('.eth', '')}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Space
                        </Button>
                      </Link>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Space Management</p>
                      <div className="flex gap-2">
                        <CreateProposalDialog
                          spaceId={space.spaceId}
                          spaceName={space.displayName}
                        />
                        <Button variant="ghost" size="sm" className="flex-1 text-xs">
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}