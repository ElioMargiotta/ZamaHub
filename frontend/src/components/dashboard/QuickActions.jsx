"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Wallet, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3"
    >
      <Card className="border-0 shadow-soft" style={{ background: 'linear-gradient(to bottom right, #4D89B0, #0369a1)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-3" style={{ color: 'white' }}>
            <Wallet className="h-6 w-6" />
            Get Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p style={{ color: 'white' }} className="leading-relaxed text-sm">
            Ready to create your private DAO space? Connect your wallet and start building secure, private governance.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span style={{ color: 'white' }}>Connect your Web3 wallet</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span style={{ color: 'white' }}>Create your DAO space</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <span style={{ color: 'white' }}>Submit private proposals</span>
            </div>
          </div>
          <Button size="sm" className="w-full hover:bg-white/90 font-semibold shadow-soft mt-4" style={{ backgroundColor: 'white', color: '#4D89B0' }} asChild>
            <a href="/app/zama-game">
              <span>Start Creating</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft" style={{ backgroundColor: 'white' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center gap-3" style={{ color: 'black' }}>
            <BookOpen className="h-5 w-5" />
            Learn More
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p style={{ color: 'black' }} className="leading-relaxed text-sm">
            Understand how AGORA enables completely private DAO governance with fine-grained control and automatic resolution.
          </p>
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start p-0 h-auto text-left hover:bg-gray-50" asChild>
              <a href="/docs" className="flex items-center gap-3 py-2 px-3 rounded-lg">
                <BookOpen className="h-4 w-4" style={{ color: '#4D89B0' }} />
                <div>
                  <div className="font-medium text-sm" style={{ color: 'black' }}>Documentation</div>
                  <div className="text-xs" style={{ color: '#6b7280' }}>Technical guides and API reference</div>
                </div>
                <ArrowRight className="h-3 w-3 ml-auto" style={{ color: '#6b7280' }} />
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start p-0 h-auto text-left hover:bg-gray-50" asChild>
              <a href="https://docs.zama.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2 px-3 rounded-lg">
                <MessageCircle className="h-4 w-4" style={{ color: '#4D89B0' }} />
                <div>
                  <div className="font-medium text-sm" style={{ color: 'black' }}>Zama Docs</div>
                  <div className="text-xs" style={{ color: '#6b7280' }}>Official FHE documentation</div>
                </div>
                <ArrowRight className="h-3 w-3 ml-auto" style={{ color: '#6b7280' }} />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}