# AGORA

A privacy-preserving governance platform using Zama's Fully Homomorphic Encryption (FHE) for anonymous voting in decentralized spaces.

## 🌟 Overview

ZamaHub is the ultimate platform to explore and test Zama's cutting-edge Fully Homomorphic Encryption (FHE) technology. Experience computation on encrypted data without decryption - enabling truly private, secure, and decentralized governance applications.

### Key Features

- **🔐 Fully Homomorphic Encryption**: Perform computations on encrypted data without ever decrypting it
- **🗳️ Privacy-Preserving Voting**: Cast anonymous votes in governance spaces while maintaining verifiability
- **🏛️ Decentralized Spaces**: Create and manage governance spaces (DAOs) with member controls
- **📝 Private Proposals**: Submit and vote on proposals with complete privacy
- **⚙️ Chainlink Automation**: Seamless, trustless automated processes for proposal resolution

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Web3 wallet (MetaMask, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ElioMargiotta/ZamaHub-repo.git
   cd ZamaHub-repo/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```


3. **Start the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Blockchain**: Ethereum, Solidity smart contracts
- **Indexing**: The Graph protocol for subgraph queries
- **Deployment**: Hardhat development environment
- **Encryption**: Zama FHE (@zama-fhe/relayer-sdk)
- **Wallet**: RainbowKit, Wagmi, Coinbase OnchainKit
- **Automation**: Chainlink oracles
- **UI Components**: Radix UI, Framer Motion animations

### Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.js                 # Landing page
│   │   ├── docs/                   # Documentation
│   │   └── app/
│   │       ├── layout.js           # App layout
│   │       ├── page.js             # App dashboard
│   │       ├── spaces/
│   │       │   └── create/
│   │       │       └── page.js     # Create new space
│   │       └── [space_name]/
│   │           ├── page.js         # Space dashboard
│   │           └── [proposal_id]/
│   │               └── page.js     # Proposal voting page
│   ├── components/
│   │   ├── landing/                # Landing page components
│   │   ├── ui/                     # Reusable UI components
│   │   ├── wallet/                 # Wallet connection components
│   │   ├── dashboard/              # Dashboard components
│   │   └── providers.jsx           # App providers
│   ├── lib/
│   │   ├── wagmi.js                # Web3 configuration
│   │   ├── apollo.ts               # GraphQL client
│   │   ├── fhevm.ts                # FHE utilities
│   │   └── utils.js                # Utility functions
│   ├── hooks/
│   │   └── useSubgraph.js          # Subgraph hooks
│   └── styles/
├── public/                         # Static assets
└── package.json                    # Dependencies
```

## 🏛️ Private Governance

The flagship feature of ZamaHub is **Private Governance** - a privacy-preserving proposal and voting system that demonstrates the power of FHE in decentralized governance.

### How It Works

1. **Create a Space**: Set up a new governance space with custom settings and member controls
2. **Submit Proposals**: Members propose ideas and initiatives within the space
3. **Vote Anonymously**: Participants cast encrypted votes with voting power based on eligibility tokens
4. **Automated Resolution**: Chainlink automation handles vote tallying and proposal execution
5. **Privacy Guaranteed**: All votes remain encrypted throughout the process

### Smart Contracts

The governance system utilizes several Solidity smart contracts deployed with Hardhat:
- `SpaceRegistry.sol`: Manages space creation and registration
- `PrivateProposalFactory.sol`: Creates new private proposal instances
- `PrivateProposal.sol`: Handles encrypted proposal voting logic
- `MockGouvernanceToken.sol`: ERC-20 token for voting eligibility

### Subgraphs

The platform uses The Graph protocol for efficient on-chain data indexing:
- `agora-sub/`: Subgraph for Agora-related events
- `subgraph/`: Main subgraph for spaces, proposals, and voting events

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests
- `npx hardhat compile` - Compile Solidity smart contracts
- `npx hardhat test` - Run smart contract tests
- `npx hardhat deploy` - Deploy contracts to network

### Environment Setup

For local development, ensure you have:

1. **Blockchain Network**: Access to testnet (Sepolia, Base Sepolia, etc.)
2. **Wallet**: Connected wallet with test tokens

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```


## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Zama FHE Documentation](https://docs.zama.ai/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Chainlink Documentation](https://docs.chain.link/)
- [The Graph Documentation](https://thegraph.com/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://zama.ai/) for the FHE technology
- [Chainlink](https://chainlink.com/) for automation infrastructure
- [The Graph](https://thegraph.com/) for decentralized indexing
- [Vercel](https://vercel.com/) for hosting platform
- [chriswilder](https://github.com/0xchriswilder) for the fhevm.ts file

---

Built with ❤️ using Zama's revolutionary FHE technology
