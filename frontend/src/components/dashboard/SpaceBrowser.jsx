"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Calendar, Plus, Eye, UserPlus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';

// Import the SpaceRegistry ABI
import spaceRegistryAbi from '@/abis/SpaceRegistry.json';

// Contract address - this should be from environment or config
const SPACE_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_SPACE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000';

export function SpaceBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  // Get user's owned spaces
  const { data: userSpaces, isLoading: userSpacesLoading } = useReadContract({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    functionName: 'getOwnerSpaces',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  });

  // Watch for space creation events to update the list
  useWatchContractEvent({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    eventName: 'SpaceCreated',
    onLogs: (logs) => {
      // Refresh spaces data when new space is created
      // In a real implementation, you'd want to maintain a more efficient state update
      window.location.reload();
    },
  });

  useWatchContractEvent({
    address: SPACE_REGISTRY_ADDRESS,
    abi: spaceRegistryAbi.abi,
    eventName: 'SpaceDisplayNameUpdated',
    onLogs: (logs) => {
      // Refresh spaces data when display name is updated
      window.location.reload();
    },
  });

  // For now, we'll use mock data that represents what would come from events
  // In production, you'd aggregate events from the blockchain
  useEffect(() => {
    // Mock spaces data - in real implementation, this would be populated from contract events
    const mockSpaces = [
      {
        spaceId: '0x1234567890abcdef',
        ensName: "defi-alliance.eth",
        displayName: "DeFi Governance Alliance",
        description: "Private governance for DeFi protocols with encrypted voting",
        owner: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        active: true,
        isOwned: address === "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      },
      {
        spaceId: '0xabcdef1234567890',
        ensName: "nft-collective.eth",
        displayName: "NFT Creator Collective",
        description: "Exclusive space for NFT creators to vote on platform decisions",
        owner: "0x1234567890abcdef1234567890abcdef12345678",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        active: true,
        isOwned: false
      },
      {
        spaceId: '0x987654321fedcba0',
        ensName: "web3-hub.eth",
        displayName: "Web3 Developer Hub",
        description: "Technical governance for Web3 infrastructure projects",
        owner: "0xabcdef1234567890abcdef1234567890abcdef12",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        active: true,
        isOwned: false
      }
    ];

    setSpaces(mockSpaces);
    setLoading(false);
  }, [address]);

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         space.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         space.ensName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const tabs = [
    { id: 'discover', label: 'Discover Spaces', count: spaces.length }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header with Create Button */}
            {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'black' }}>Spaces</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Discover and join private DAO governance spaces
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/spaces/my">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              <UserPlus className="h-4 w-4 mr-2" />
              My Spaces
            </Button>
          </Link>
          <Link href="/app/spaces/create">
            <Button className="shadow-soft" style={{ backgroundColor: '#4D89B0', color: 'white' }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Space
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#6b7280' }} />
          <Input
            placeholder="Search spaces by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-300"
          />
        </div>
        <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-black'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading spaces...</p>
            </div>
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">
              {searchQuery ? 'No spaces found matching your search.' : 'No spaces available to discover.'}
            </p>
          </div>
        ) : (
          filteredSpaces.map((space, index) => (
            <motion.div
              key={space.spaceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/app/spaces/${space.ensName.replace('.eth', '')}`}>
                <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {space.displayName}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-sm line-clamp-2">
                          {space.description}
                        </CardDescription>
                        <p className="text-xs text-gray-500 mt-1">{space.ensName}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Owner: {space.owner.slice(0, 6)}...{space.owner.slice(-4)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{space.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={space.active ? "default" : "secondary"}>
                        {space.active ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-black hover:bg-gray-100"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Enter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No spaces found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </motion.div>
  );
}