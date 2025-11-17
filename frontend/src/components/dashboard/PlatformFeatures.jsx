"use client";
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Globe, Users, Code } from 'lucide-react';

export function PlatformFeatures() {
  const features = [
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "Your votes and proposals remain completely private. No one can see how you voted, no matter what the outcome."
    },
    {
      icon: Users,
      title: "Fine-Grained Control",
      description: "Customize voting access, proposal types, quorum requirements, and resolution strategies for your DAO."
    },
    {
      icon: Lock,
      title: "Secure Spaces",
      description: "Create private governance spaces with encrypted communication and tamper-proof voting records."
    },
    {
      icon: Globe,
      title: "Multi-Chain Support",
      description: "Deploy your DAO across multiple blockchains while maintaining privacy and security guarantees."
    },
    {
      icon: Zap,
      title: "Chainlink Automation",
      description: "Automatic proposal execution and resolution using decentralized oracles for reliable, trustless outcomes."
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Easy-to-use APIs and templates for building custom governance mechanisms and voting strategies."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'black' }}>Why Choose AGORA?</h2>
        <p className="text-base max-w-2xl mx-auto" style={{ color: 'black' }}>
          Experience the future of private DAO governance with complete privacy, fine-grained control, and automatic resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          >
            <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: '#f0f9ff' }}>
                <feature.icon className="h-5 w-5" style={{ color: '#4D89B0' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'black' }}>{feature.title}</h3>
                <p style={{ color: 'black' }} className="leading-relaxed text-sm">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}