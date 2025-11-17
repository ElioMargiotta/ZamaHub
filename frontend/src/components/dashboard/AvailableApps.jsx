"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Gamepad2, Lock, Clock, Shield, Users, Zap, ArrowUpRight } from 'lucide-react';

export function AvailableApps() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
    >
      <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: 'white' }}>
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#f0f9ff' }}>
              <Gamepad2 className="h-7 w-7" style={{ color: '#4D89B0' }} />
            </div>
            <div>
              <h3 className="font-semibold text-xl" style={{ color: 'black' }}>Create DAO Space</h3>
              <p className="text-sm" style={{ color: 'black' }}>Private Governance Platform</p>
            </div>
          </div>
          <p className="mb-6 leading-relaxed" style={{ color: 'black' }}>
            Launch your own private DAO with fine-grained control over proposals, voting strategies, and access management. Everything stays encrypted.
          </p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full" style={{ color: 'black' }}>
              <Shield className="h-3.5 w-3.5" style={{ color: '#4D89B0' }} />
              <span>Fully Private</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full" style={{ color: 'black' }}>
              <Users className="h-3.5 w-3.5" style={{ color: '#4D89B0' }} />
              <span>Custom Access</span>
            </div>
          </div>
          <Button size="lg" className="w-full font-medium shadow-soft" style={{ backgroundColor: '#4D89B0', color: 'white' }} asChild>
            <a href="/app/zama-game">
              <span>Create Space</span>
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-dashed shadow-soft opacity-75 hover:opacity-90 transition-all duration-300" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Lock className="h-7 w-7" style={{ color: '#6b7280' }} />
            </div>
            <div>
              <h3 className="font-semibold text-xl" style={{ color: 'black' }}>Proposal Templates</h3>
              <p className="text-sm" style={{ color: 'black' }}>Pre-built Governance Tools</p>
            </div>
          </div>
          <p className="mb-6 leading-relaxed" style={{ color: 'black' }}>
            Use pre-configured proposal types with advanced voting strategies, quorum settings, and automatic execution conditions.
          </p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full" style={{ color: 'black' }}>
              <Shield className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
              <span>Configurable</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full" style={{ color: 'black' }}>
              <Zap className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
              <span>Auto-Execute</span>
            </div>
          </div>
          <Button size="lg" variant="outline" className="w-full hover:bg-gray-50" style={{ borderColor: '#d1d5db', color: '#6b7280' }} disabled>
            <span>Coming Soon</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-dashed shadow-soft opacity-75 hover:opacity-90 transition-all duration-300 md:col-span-2 lg:col-span-1" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Clock className="h-7 w-7" style={{ color: '#6b7280' }} />
            </div>
            <div>
              <h3 className="font-semibold text-xl" style={{ color: 'black' }}>Chainlink Automation</h3>
              <p className="text-sm" style={{ color: 'black' }}>Smart Resolution Engine</p>
            </div>
          </div>
          <p className="mb-6 leading-relaxed" style={{ color: 'black' }}>
            Automatic proposal resolution and execution using Chainlink's decentralized oracle network for reliable, tamper-proof outcomes.
          </p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full" style={{ color: 'black' }}>
              <Shield className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
              <span>Decentralized</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded-full" style={{ color: 'black' }}>
              <Zap className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
              <span>Automated</span>
            </div>
          </div>
          <Button size="lg" variant="outline" className="w-full hover:bg-gray-50" style={{ borderColor: '#d1d5db', color: '#6b7280' }} disabled>
            <span>Coming Soon</span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}