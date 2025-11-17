"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Vote,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const userStats = {
    joinedSpaces: 3,
    activeProposals: 7,
    votesCast: 24,
    spacesCreated: 1
  };

  const joinedSpaces = [
    {
      id: 1,
      name: "DeFi Governance Alliance",
      role: "Member",
      activeProposals: 3,
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      name: "NFT Creator Collective",
      role: "Admin",
      activeProposals: 2,
      lastActivity: "5 hours ago"
    },
    {
      id: 5,
      name: "Privacy Protocol Alliance",
      role: "Member",
      activeProposals: 1,
      lastActivity: "1 day ago"
    }
  ];

  const activeProposals = [
    {
      id: 1,
      spaceName: "DeFi Governance Alliance",
      title: "Implement New Treasury Management System",
      status: "active",
      timeLeft: "2 days",
      userVote: null,
      totalVotes: 234
    },
    {
      id: 2,
      spaceName: "DeFi Governance Alliance",
      title: "Update Protocol Fee Structure",
      status: "active",
      timeLeft: "1 day",
      userVote: "yes",
      totalVotes: 189
    },
    {
      id: 3,
      spaceName: "NFT Creator Collective",
      title: "Launch Creator Royalty Program",
      status: "active",
      timeLeft: "3 days",
      userVote: null,
      totalVotes: 156
    },
    {
      id: 4,
      spaceName: "Privacy Protocol Alliance",
      title: "Adopt New Privacy Standards",
      status: "active",
      timeLeft: "5 days",
      userVote: "no",
      totalVotes: 98
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "vote",
      spaceName: "DeFi Governance Alliance",
      description: "Voted 'Yes' on treasury proposal",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "proposal",
      spaceName: "NFT Creator Collective",
      description: "Created new proposal for royalty program",
      time: "5 hours ago"
    },
    {
      id: 3,
      type: "join",
      spaceName: "Privacy Protocol Alliance",
      description: "Joined the space",
      time: "1 day ago"
    },
    {
      id: 4,
      type: "vote",
      spaceName: "DeFi Governance Alliance",
      description: "Voted 'No' on fee structure update",
      time: "2 days ago"
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'proposals', label: 'Active Proposals' },
    { id: 'activity', label: 'Recent Activity' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-black mb-2">Welcome back!</h1>
        <p className="text-gray-600">Here's your governance activity overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{userStats.joinedSpaces}</p>
              <p className="text-sm text-gray-600">Joined Spaces</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Vote className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{userStats.activeProposals}</p>
              <p className="text-sm text-gray-600">Active Proposals</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{userStats.votesCast}</p>
              <p className="text-sm text-gray-600">Votes Cast</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{userStats.spacesCreated}</p>
              <p className="text-sm text-gray-600">Spaces Created</p>
            </div>
          </div>
        </motion.div>
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
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Spaces */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">My Spaces</h2>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {joinedSpaces.map((space) => (
                <div key={space.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-black">{space.name}</p>
                    <p className="text-sm text-gray-600">{space.role} • {space.activeProposals} active proposals</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Enter
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-black mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-1 bg-gray-100 rounded">
                    {activity.type === 'vote' && <Vote className="h-3 w-3 text-green-600" />}
                    {activity.type === 'proposal' && <MessageSquare className="h-3 w-3 text-blue-600" />}
                    {activity.type === 'join' && <Users className="h-3 w-3 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-black">{activity.description}</p>
                    <p className="text-xs text-gray-600">{activity.spaceName} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'proposals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {activeProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{proposal.spaceName}</p>
                  <h3 className="text-lg font-semibold text-black">{proposal.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{proposal.timeLeft} left</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Vote className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{proposal.totalVotes} votes</span>
                  </div>
                  {proposal.userVote && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Voted {proposal.userVote}</span>
                    </div>
                  )}
                </div>

                {proposal.userVote ? (
                  <Button size="sm" variant="outline" disabled>
                    Vote Submitted
                  </Button>
                ) : (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Cast Vote
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-black mb-6">Activity Timeline</h2>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'vote' ? 'bg-green-100' :
                    activity.type === 'proposal' ? 'bg-blue-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'vote' && <Vote className="h-4 w-4 text-green-600" />}
                    {activity.type === 'proposal' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'join' && <Users className="h-4 w-4 text-purple-600" />}
                  </div>
                  {index < recentActivity.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-black font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.spaceName} • {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}