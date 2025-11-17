"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vote, DollarSign, Trophy, Shield, Clock, TrendingUp, Award, List, Calendar, CheckCircle, XCircle, ExternalLink, AlertTriangle } from "lucide-react";
import VotingFactoryABI from "./contracts/VotingFactory.sol/VotingFactory.json";
import PrivateVotingABI from "./contracts/zamahub.sol/PrivateVoting.json";
import MockUSDCABI from "./contracts/MockUSDC.sol/MockUSDC.json";


export default function ZamaMindGamesPage() {
  const [status, setStatus] = useState("Initializing...");
  const [instance, setInstance] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [activeTab, setActiveTab] = useState("votings");
  const [wrongNetwork, setWrongNetwork] = useState(false);
  
  // Create voting form state
  const [votingName, setVotingName] = useState("");
  const [voteDeposit, setVoteDeposit] = useState("10");
  const [votingDuration, setVotingDuration] = useState("300"); // 5 minutes in seconds (minimum)
  const [votingStartTime, setVotingStartTime] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  
  // Voting options state
  const [optionA, setOptionA] = useState({ emoji: "🎯", label: "Option A", description: "Moderate Growth - $4,000" });
  const [optionB, setOptionB] = useState({ emoji: "🚀", label: "Option B", description: "Moon Shot - $10,000" });
  const [optionC, setOptionC] = useState({ emoji: "📉", label: "Option C", description: "Bear Market - $2,000" });
  
  // Votings list state
  const [allVotings, setAllVotings] = useState([]);
  const [ongoingVotings, setOngoingVotings] = useState([]);
  const [upcomingVotings, setUpcomingVotings] = useState([]);
  const [endedVotings, setEndedVotings] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  
  // Filter and search state
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Get filtered votings based on current filter and search
  const getFilteredVotings = () => {
    let votings = [];
    
    switch (currentFilter) {
      case "active":
        votings = ongoingVotings;
        break;
      case "upcoming":
        votings = upcomingVotings;
        break;
      case "ended":
        votings = endedVotings;
        break;
      default:
        votings = allVotings;
    }
    
    // Apply search filter
    if (searchTerm) {
      votings = votings.filter(voting => 
        voting.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    votings.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.startTime || b.endTime) - (a.startTime || a.endTime);
        case "oldest":
          return (a.startTime || a.endTime) - (b.startTime || b.endTime);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return votings;
  };
  
  // Helper function to format time duration
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${secs}s`;
    }
  };
  
  // Selected voting state
  const [selectedVoting, setSelectedVoting] = useState(null);
  const [votingData, setVotingData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [votingLoading, setVotingLoading] = useState(false);

  // Deployed contract addresses
  const votingFactoryAddress = "0x3741Cee30e6cda6C666De42c41Dc471EbC6b091d";
  const usdcContractAddress = "0xffE01B10073099afafE2D09fE4c125E68864587A";
  const wheelPoolAddress = "0xd2F31a7F36f74ae697f790d01B45DBc4a9Ade429";
  const protocolTreasuryAddress = "0xF92c6d8F1cba15eE6c737a7E5c121ad5b6b78982";

  // Mouse tracking for Hero-style animations
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // === Initialize the Zama SDK ===
  useEffect(() => {
    const initZama = async () => {
      try {
        setStatus("Initializing secure connection...");

        // Load Zama FHE SDK
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import {
            initSDK,
            createInstance,
            SepoliaConfig,
          } from 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js';

          window.ZamaSDK = {
            initSDK,
            createInstance,
            SepoliaConfig
          };
          window.dispatchEvent(new CustomEvent('zama-sdk-ready'));
        `;
        document.head.appendChild(script);

        // Wait for SDK to load
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Connection timeout"));
          }, 15000);

          window.addEventListener('zama-sdk-ready', () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });

        const { initSDK, createInstance, SepoliaConfig } = window.ZamaSDK;
        if (!initSDK) throw new Error("SDK failed to load");

        await initSDK();

        // Check if wallet is already connected
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              const userAddr = ethers.getAddress(accounts[0]);
              setUserAddress(userAddr);

              // Create FHE instance with network
              const config = { ...SepoliaConfig, network: window.ethereum };
              const instance = await createInstance(config);
              setInstance(instance);

              setStatus("Ready");
              return;
            }
          } catch (err) {
            console.warn("Failed to check existing accounts:", err);
          }
        }

        // If not connected, just set instance without network
        const config = { ...SepoliaConfig };
        const instance = await createInstance(config);
        setInstance(instance);

        setStatus("Ready to connect wallet");
      } catch (err) {
        console.error("Initialization failed:", err);
        setStatus(`Connection failed: ${err.message}`);
      }
    };

    initZama();
  }, []);

  // Check network on component mount
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== '0xaa36a7') {
            setWrongNetwork(true);
          } else {
            setWrongNetwork(false);
          }
        } catch (error) {
          console.error('Error checking initial network:', error);
        }
      }
    };
    
    checkNetwork();
  }, []);

  // Listen for wallet changes and refresh
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // Disconnected
          window.location.reload();
        } else {
          // Account changed
          window.location.reload();
        }
      };

      const handleChainChanged = async () => {
        // Network changed - check if it's Sepolia
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== '0xaa36a7') {
            setWrongNetwork(true);
            setStatus('Wrong network, please switch to Ethereum Sepolia');
          } else {
            setWrongNetwork(false);
            setStatus('Ready');
            // Reload to reinitialize with correct network
            window.location.reload();
          }
        } catch (error) {
          console.error('Error checking chain:', error);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Manual connect handler in case the SDK init didn't request accounts yet
  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus("Wallet not detected. Install MetaMask or similar.");
        return;
      }

      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const addr = ethers.getAddress(accounts[0]);
      setUserAddress(addr);

      // Ensure Sepolia network (chainId 11155111 -> 0xaa36a7)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        setWrongNetwork(true);
        setStatus('Wrong network, please switch to Ethereum Sepolia');
        // Attempt to prompt switch (best-effort)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
          setWrongNetwork(false);
          setStatus('Switched to Sepolia — ready');
        } catch (switchErr) {
          console.warn('Network switch failed', switchErr);
        }
      } else {
        setWrongNetwork(false);
        setStatus('Ready');
      }

      // Refresh the page to apply changes
      window.location.reload();
    } catch (err) {
      console.error('Connect wallet failed', err);
      setStatus(err.message || 'Failed to connect wallet');
    }
  };

  // === FACTORY FUNCTIONS ===

  // Load all votings from factory
  const loadAllVotings = useCallback(async () => {
    try {
      setListLoading(true);
      console.log("📡 Connecting to VotingFactory at:", votingFactoryAddress);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const factory = new ethers.Contract(
        votingFactoryAddress,
        VotingFactoryABI.abi,
        provider
      );

      // Get all votings categorized
      console.log("🔍 Fetching votings from factory...");
      const [all, ongoing, upcoming, ended] = await Promise.all([
        factory.getAllVotings(),
        factory.getActiveVotings(),
        factory.getUpcomingVotings(),
        factory.getEndedVotings()
      ]);
      
      console.log("📊 Factory returned:", {
        all: all.length,
        ongoing: ongoing.length,
        upcoming: upcoming.length,
        ended: ended.length
      });
      console.log("📍 All voting addresses:", all);
      console.log("📍 Ongoing addresses:", ongoing);
      console.log("📍 Upcoming addresses:", upcoming);
      console.log("📍 Ended addresses:", ended);

      // Load details for each voting
      const loadVotingDetails = async (address) => {
        const voting = new ethers.Contract(address, PrivateVotingABI.abi, provider);
        try {
          const [name, startTime, endTime, depositAmount, resolved, revealed] = await Promise.all([
            voting.name(),
            voting.votingStartTime(),
            voting.votingEndTime(),
            voting.VOTE_DEPOSIT_AMOUNT(),
            voting.votingResolved(),
            voting.resultsRevealed()
          ]);
          
          return {
            address,
            name,
            startTime: Number(startTime),
            endTime: Number(endTime),
            depositAmount: ethers.formatUnits(depositAmount, 6),
            resolved,
            revealed
          };
        } catch (err) {
          console.error(`Error loading voting ${address}:`, err);
          return null;
        }
      };

      const [allDetails, ongoingDetails, upcomingDetails, endedDetails] = await Promise.all([
        Promise.all(all.map(loadVotingDetails)),
        Promise.all(ongoing.map(loadVotingDetails)),
        Promise.all(upcoming.map(loadVotingDetails)),
        Promise.all(ended.map(loadVotingDetails))
      ]);

      setAllVotings(allDetails.filter(Boolean));
      setOngoingVotings(ongoingDetails.filter(Boolean));
      setUpcomingVotings(upcomingDetails.filter(Boolean));
      setEndedVotings(endedDetails.filter(Boolean));
      
      console.log("✅ Votings loaded:", { all: allDetails.length, ongoing: ongoingDetails.length, upcoming: upcomingDetails.length, ended: endedDetails.length });
    } catch (err) {
      console.error("❌ Failed to load votings:", err);
      setStatus(`❌ Failed to load votings: ${err.message}`);
    } finally {
      setListLoading(false);
    }
  }, [votingFactoryAddress]);

  // Check if user is whitelisted to create votings
  const checkWhitelist = useCallback(async () => {
    try {
      if (!userAddress) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const factory = new ethers.Contract(
        votingFactoryAddress,
        VotingFactoryABI.abi,
        provider
      );

      const whitelisted = await factory.isWhitelisted(userAddress);
      setIsWhitelisted(whitelisted);
    } catch (err) {
      console.error("Failed to check whitelist:", err);
      setIsWhitelisted(false);
    }
  }, [userAddress]);

  // Create a new voting
  const handleCreateVoting = async () => {
    try {
      if (!votingName.trim()) {
        throw new Error("Please enter a voting name");
      }
      if (!votingStartTime) {
        throw new Error("Please select a start time");
      }

      setCreateLoading(true);
      setStatus("Creating mind game...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(
        votingFactoryAddress,
        VotingFactoryABI.abi,
        signer
      );

      // Convert inputs
      const depositAmount = ethers.parseUnits(voteDeposit, 6);
      const startTimeUnix = Math.floor(new Date(votingStartTime).getTime() / 1000);
      const durationSeconds = Number(votingDuration);

      const tx = await factory.createVoting(
        votingName,
        depositAmount,
        startTimeUnix,
        durationSeconds
      );

      setStatus(`⏳ Creating mind game: ${tx.hash}`);
      const receipt = await tx.wait();
      
      // Extract the voting address from events
      const event = receipt.logs.find(log => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed.name === "VotingCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = factory.interface.parseLog(event);
        const newVotingAddress = parsed.args.votingAddress;
        
        // Store custom options in localStorage
        const customOptions = {
          0: optionA,
          1: optionB,
          2: optionC
        };
        localStorage.setItem(`voting_options_${newVotingAddress}`, JSON.stringify(customOptions));
        
        setStatus(`✅ Mind game created at: ${newVotingAddress}`);
      } else {
        setStatus("✅ Mind game created successfully!");
      }

      // Reset form
      setVotingName("");
      setVotingStartTime("");
      setOptionA({ emoji: "🎯", label: "Option A", description: "Moderate Growth - $4,000" });
      setOptionB({ emoji: "🚀", label: "Option B", description: "Moon Shot - $10,000" });
      setOptionC({ emoji: "📉", label: "Option C", description: "Bear Market - $2,000" });
      
      // Reload votings list and switch to votings tab
      console.log("🔄 Reloading mind games list...");
      await loadAllVotings();
      setActiveTab("votings");
    } catch (err) {
      console.error("❌ Create Mind Game Error:", err);
      setStatus(`❌ Failed to create mind game: ${err.message || err.reason}`);
    } finally {
      setCreateLoading(false);
    }
  };

  // Load voting data for a specific voting contract
  const loadVotingData = useCallback(async (votingAddress = selectedVoting) => {
    if (!votingAddress) return;
    try {
      if (!userAddress) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const votingContract = new ethers.Contract(
        votingAddress,
        PrivateVotingABI.abi,
        provider
      );
      const usdcContract = new ethers.Contract(
        usdcContractAddress,
        MockUSDCABI.abi,
        provider
      );

      const [
        name,
        votingStartTime,
        votingEndTime,
        totalVotingUSDC,
        hasVoted,
        hasClaimedReward,
        resultsRevealed,
        votingResolved,
        timeRemaining,
        usdcBal,
        voteDecrypted
      ] = await Promise.all([
        votingContract.name(),
        votingContract.votingStartTime(),
        votingContract.votingEndTime(),
        votingContract.totalVotingUSDC(),
        votingContract.hasVoted(userAddress),
        votingContract.hasClaimedReward(userAddress),
        votingContract.resultsRevealed(),
        votingContract.votingResolved(),
        votingContract.timeUntilVotingEnds(),
        usdcContract.balanceOf(userAddress),
        votingContract.voteDecrypted(userAddress)
      ]);

      const data = {
        name,
        votingStartTime: Number(votingStartTime),
        votingEndTime: Number(votingEndTime),
        totalVotingUSDC: ethers.formatUnits(totalVotingUSDC, 6),
        hasVoted,
        hasClaimedReward,
        resultsRevealed,
        votingResolved,
        timeRemaining: Number(timeRemaining),
        voteDecrypted
      };

      // Load vote counts and rankings if revealed
      if (resultsRevealed && votingResolved) {
        const [votesA, votesB, votesC, minorityOption, middleOption, majorityOption, minorityMultiplier, middleMultiplier, majorityMultiplier] = await Promise.all([
          votingContract.votesA(),
          votingContract.votesB(),
          votingContract.votesC(),
          votingContract.minorityOption(),
          votingContract.middleOption(),
          votingContract.majorityOption(),
          votingContract.minorityMultiplier(),
          votingContract.middleMultiplier(),
          votingContract.majorityMultiplier()
        ]);
        data.votesA = Number(votesA);
        data.votesB = Number(votesB);
        data.votesC = Number(votesC);
        data.minorityOption = Number(minorityOption);
        data.middleOption = Number(middleOption);
        data.majorityOption = Number(majorityOption);
        data.minorityMultiplier = Number(minorityMultiplier);
        data.middleMultiplier = Number(middleMultiplier);
        data.majorityMultiplier = Number(majorityMultiplier);
      }

      // Load user's decrypted vote if available
      if (voteDecrypted) {
        const decryptedVote = await votingContract.decryptedVotes(userAddress);
        data.userDecryptedVote = Number(decryptedVote);
        
        // Calculate user's reward amount if voting is resolved
        if (resultsRevealed && votingResolved) {
          const netDeposit = 9.8; // 10 USDC - 2% fee = 9.8 USDC
          let multiplier = 0;

          if (data.userDecryptedVote === data.minorityOption) {
            multiplier = data.minorityMultiplier;
          } else if (data.userDecryptedVote === data.middleOption) {
            multiplier = data.middleMultiplier;
          } else if (data.userDecryptedVote === data.majorityOption) {
            multiplier = data.majorityMultiplier;
          }

          data.userRewardAmount = (netDeposit * multiplier) / 100;
        }
      }

      // Load custom options from localStorage if available
      const storedOptions = localStorage.getItem(`voting_options_${votingAddress}`);
      if (storedOptions) {
        try {
          data.customOptions = JSON.parse(storedOptions);
        } catch (e) {
          console.error("Failed to parse stored options:", e);
        }
      }

      setVotingData(data);
      setUsdcBalance(ethers.formatUnits(usdcBal, 6));
      console.log("✅ Voting data loaded:", data);
    } catch (err) {
      console.error("❌ Failed to load voting data:", err);
    }
  }, [userAddress, selectedVoting]);

  // Mint Mock USDC
  const handleMintUSDC = async () => {
    try {
      setVotingLoading(true);
      setStatus("Minting 1000 USDC...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdcContract = new ethers.Contract(
        usdcContractAddress,
        MockUSDCABI.abi,
        signer
      );

      const amount = ethers.parseUnits("1000", 6);
      const tx = await usdcContract.mint(userAddress, amount);
      
      setStatus(`⏳ Minting USDC: ${tx.hash}`);
      await tx.wait();

      setStatus("✅ Minted 1000 USDC successfully!");
      await loadUSDCBalance();
      if (selectedVoting) {
        await loadVotingData();
      }
    } catch (err) {
      console.error("❌ Mint Error:", err);
      setStatus(`❌ Mint failed: ${err.message || err.reason}`);
    } finally {
      setVotingLoading(false);
    }
  };

  // Vote with encrypted option
  const handleVote = async () => {
    try {
      if (!instance) throw new Error("SDK not ready");
      if (selectedOption === null) throw new Error("Select an option");

      // Check if voting has started
      const now = Math.floor(Date.now() / 1000);
      if (votingData && votingData.votingStartTime > now) {
        throw new Error("Voting has not started yet");
      }

      setVotingLoading(true);
      
      if (parseFloat(usdcBalance) < 10) {
        throw new Error("Insufficient USDC balance. Mint some first!");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const usdcContract = new ethers.Contract(
        usdcContractAddress,
        MockUSDCABI.abi,
        signer
      );
      
      if (!selectedVoting) throw new Error("No voting selected");
      
      const allowance = await usdcContract.allowance(userAddress, selectedVoting);
      const requiredAmount = ethers.parseUnits(votingData?.depositAmount || "10", 6);
      
      if (allowance < requiredAmount) {
        setStatus("Approving USDC...");
        const approveTx = await usdcContract.approve(selectedVoting, requiredAmount);
        await approveTx.wait();
      }

      setStatus("Encrypting your vote...");
      const buffer = instance.createEncryptedInput(selectedVoting, userAddress);
      buffer.add8(selectedOption);
      
      const ciphertexts = await buffer.encrypt();

      const votingContract = new ethers.Contract(
        selectedVoting,
        PrivateVotingABI.abi,
        signer
      );

      setStatus("Submitting vote...");
      const tx = await votingContract.depositVote(
        ciphertexts.handles[0],
        ciphertexts.inputProof
      );

      setStatus(`⏳ Confirming vote: ${tx.hash}`);
      await tx.wait();

      setStatus("✅ Vote submitted successfully!");
      setSelectedOption(null);
      await loadVotingData();
    } catch (err) {
      console.error("❌ Vote Error:", err);
      setStatus(`❌ Vote failed: ${err.message || err.reason}`);
    } finally {
      setVotingLoading(false);
    }
  };

  // Request vote decryption - separate step before claiming
  const handleRequestDecryption = async () => {
    try {
      if (!selectedVoting) throw new Error("No voting selected");
      
      setVotingLoading(true);
      setStatus("🔐 Requesting vote decryption...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(
        selectedVoting,
        PrivateVotingABI.abi,
        signer
      );

      // Call the separate requestUserVoteDecryption function
      const tx = await votingContract.requestUserVoteDecryption();
      setStatus(`⏳ Confirming decryption request: ${tx.hash}`);
      await tx.wait();

      setStatus("✅ Decryption requested! Waiting for oracle callback (10-30s)...");
      
      // Auto-check for decryption completion
      const checkInterval = setInterval(async () => {
        try {
          await loadVotingData();
          const isDecrypted = await votingContract.voteDecrypted(userAddress);
          if (isDecrypted) {
            clearInterval(checkInterval);
            setStatus("✅ Vote decrypted! Now you can claim your reward");
          }
        } catch (e) {
          console.error("Check interval error:", e);
        }
      }, 5000);
      
      setTimeout(() => clearInterval(checkInterval), 120000);
    } catch (err) {
      console.error("❌ Decryption request error:", err);
      const errorMessage = err.reason || err.message || '';
      setStatus(`❌ Decryption request failed: ${errorMessage}`);
    } finally {
      setVotingLoading(false);
    }
  };

  // Claim reward - only works after vote is decrypted
  const handleClaimReward = async () => {
    try {
      setVotingLoading(true);

      if (!selectedVoting) throw new Error("No voting selected");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(
        selectedVoting,
        PrivateVotingABI.abi,
        signer
      );

      // Check if vote is already decrypted
      const voteDecrypted = await votingContract.voteDecrypted(userAddress);
      
      if (!voteDecrypted) {
        setStatus("⚠️ Please request decryption first!");
        setVotingLoading(false);
        return;
      }

      setStatus("💰 Claiming your reward...");
      const tx = await votingContract.claimReward();
      setStatus(`⏳ Confirming transaction: ${tx.hash}`);
      await tx.wait();

      setStatus("✅ Reward claimed successfully!");
      await loadVotingData();
    } catch (err) {
      console.error("❌ Claim Error:", err);
      const errorMessage = err.reason || err.message || (err.revert && err.revert.args && err.revert.args[0]) || '';
      setStatus(`❌ Claim failed: ${errorMessage || 'Unknown error'}`);
    } finally {
      setVotingLoading(false);
    }
  };

  // Load USDC balance
  const loadUSDCBalance = useCallback(async () => {
    if (!userAddress) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const usdcContract = new ethers.Contract(
        usdcContractAddress,
        MockUSDCABI.abi,
        provider
      );
      const balance = await usdcContract.balanceOf(userAddress);
      setUsdcBalance(ethers.formatUnits(balance, 6));
    } catch (err) {
      console.error("Failed to load USDC balance:", err);
    }
  }, [userAddress]);

  // Load votings list on tab change
  useEffect(() => {
    if (userAddress && activeTab === "votings") {
      loadAllVotings();
    }
    if (userAddress && activeTab === "info") {
      loadUSDCBalance();
    }
  }, [userAddress, activeTab, loadAllVotings, loadUSDCBalance]);

  // Check whitelist status when user address is available
  useEffect(() => {
    if (userAddress) {
      checkWhitelist();
    }
  }, [userAddress, checkWhitelist]);

  // Load voting data when a voting is selected
  useEffect(() => {
    if (selectedVoting && userAddress && instance) {
      loadVotingData();
      const interval = setInterval(() => loadVotingData(), 30000);
      return () => clearInterval(interval);
    }
  }, [selectedVoting, userAddress, instance, loadVotingData]);

  // Helper functions
  const getOptionInfo = (option) => {
    // Try to get custom options from the voting data first, otherwise use defaults
    if (votingData?.customOptions) {
      return votingData.customOptions[option];
    }
    
    const options = {
      0: optionA,
      1: optionB,
      2: optionC
    };
    return options[option] || optionA;
  };

  const getRankInfo = (option) => {
    if (!votingData) return null;

    const votes = [votingData.votesA, votingData.votesB, votingData.votesC];
    const uniqueVotes = [...new Set(votes)].sort((a, b) => b - a); // Sort descending: [highest, middle, lowest]

    // Check for perfect tie (all three options have same votes)
    const isPerfectTie = uniqueVotes.length === 1;

    if (isPerfectTie) {
      return { label: "Perfect Tie (Full Refund)", color: "text-blue-600", bgColor: "bg-blue-500/10", emoji: "🔄" };
    }

    // Use contract's logic: minorityOption = winner (gets prize), majorityOption = loser (gets refund)
    if (option === votingData.minorityOption) {
      return { label: "Winner (Minority)", color: "text-green-600", bgColor: "bg-green-500/10", emoji: "🏆" };
    }

    if (option === votingData.middleOption) {
      return { label: "Middle Position", color: "text-yellow-600", bgColor: "bg-yellow-500/10", emoji: "�" };
    }

    if (option === votingData.majorityOption) {
      return { label: "Majority (Loss)", color: "text-red-600", bgColor: "bg-red-500/10", emoji: "❌" };
    }

    return { label: "No Votes", color: "text-gray-600", bgColor: "bg-gray-500/10", emoji: "⚪" };

    if (option === votingData.middleOption) {
      if (hasTies && votes.filter(v => v === votes[option]).length > 1) {
        return { label: "Tie Middle (Partial)", color: "text-yellow-600", bgColor: "bg-yellow-500/10", emoji: "�" };
      }
      return { label: "Middle Position", color: "text-yellow-600", bgColor: "bg-yellow-500/10", emoji: "�🥈" };
    }

      return { label: "Middle Position", color: "text-yellow-600", bgColor: "bg-yellow-500/10", emoji: "🥈" };
    }

  // === UI ===
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Vote className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Zama Mind Games
            </h1>
          </div>
          <p className="text-xl font-semibold text-muted-foreground max-w-2xl mx-auto">
            Participate in secure, privacy-preserving Zama Mind Games
          </p>
        </motion.div>

        {/* Wrong Network Error */}
        {wrongNetwork && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Card className="border-2 border-red-500 bg-red-500/5">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-red-600">Wrong Network</h3>
                    <p className="text-muted-foreground">
                      Please switch to Ethereum Sepolia to use Zama Mind Games
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        await window.ethereum.request({
                          method: 'wallet_switchEthereumChain',
                          params: [{ chainId: '0xaa36a7' }],
                        });
                      } catch (error) {
                        console.error('Failed to switch network:', error);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Switch to Sepolia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {instance ? (
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="votings" className="text-lg">
                  <List className="mr-2 h-5 w-5" />
                  View Mind Games
                </TabsTrigger>
                <TabsTrigger value="vote" className="text-lg" disabled={!selectedVoting}>
                  <Vote className="mr-2 h-5 w-5" />
                  {selectedVoting ? "Mind Game Details" : "Select a Mind Game"}
                </TabsTrigger>
                <TabsTrigger value="create" className="text-lg">
                  <Award className="mr-2 h-5 w-5" />
                  Create Mind Game
                </TabsTrigger>
                <TabsTrigger value="info" className="text-lg">
                  <Shield className="mr-2 h-5 w-5" />
                  Rules & Mint
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: View Votings */}
              <TabsContent value="votings" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Filters and Search */}
                  <Card className="border-2 mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <List className="h-5 w-5" />
                            All Mind Games
                          </CardTitle>
                          <CardDescription>
                            Browse and participate in Zama Mind Games
                          </CardDescription>
                        </div>
                        <Button 
                          onClick={loadAllVotings} 
                          disabled={listLoading}
                          className="shrink-0"
                        >
                          {listLoading ? "Loading..." : "Refresh"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={currentFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentFilter("all")}
                            className="flex items-center gap-2"
                          >
                            <List className="h-4 w-4" />
                            All ({allVotings.length})
                          </Button>
                          <Button
                            variant={currentFilter === "active" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentFilter("active")}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Active ({ongoingVotings.length})
                          </Button>
                          <Button
                            variant={currentFilter === "upcoming" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentFilter("upcoming")}
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Upcoming ({upcomingVotings.length})
                          </Button>
                          <Button
                            variant={currentFilter === "ended" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentFilter("ended")}
                            className="flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Ended ({endedVotings.length})
                          </Button>
                        </div>

                        {/* Search and Sort */}
                        <div className="flex gap-2 flex-1 lg:justify-end">
                          <div className="relative flex-1 lg:w-64">
                            <Input
                            placeholder="Search mind games..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8"
                            />
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name A-Z</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Votings List */}
                  <div className="space-y-4">
                    {getFilteredVotings().length > 0 ? (
                      getFilteredVotings().map((voting) => {
                        const now = Date.now() / 1000;
                        const isActive = voting.startTime <= now && voting.endTime > now;
                        const isUpcoming = voting.startTime > now;
                        const isEnded = voting.endTime <= now;
                        
                        let statusColor = "gray";
                        let statusText = "Unknown";
                        let statusIcon = <Clock className="h-4 w-4" />;
                        
                        if (isActive) {
                          statusColor = "green";
                          statusText = "Active";
                          statusIcon = <CheckCircle className="h-4 w-4" />;
                        } else if (isUpcoming) {
                          statusColor = "blue";
                          statusText = "Upcoming";
                          statusIcon = <Calendar className="h-4 w-4" />;
                        } else if (isEnded) {
                          statusColor = "gray";
                          statusText = "Ended";
                          statusIcon = <XCircle className="h-4 w-4" />;
                        }
                        
                        return (
                          <motion.div
                            key={voting.address}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card 
                              className={`border-2 cursor-pointer hover:shadow-lg transition-all ${
                                isActive ? 'border-green-500/50 hover:border-green-500' :
                                isUpcoming ? 'border-blue-500/50 hover:border-blue-500' :
                                'border-gray-500/50 hover:border-gray-500'
                              }`}
                              onClick={() => {
                                setSelectedVoting(voting.address);
                                setActiveTab("vote");
                              }}
                            >
                              <CardContent className="pt-6 pb-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-2 rounded-lg ${
                                        statusColor === 'green' ? 'bg-green-500/20' :
                                        statusColor === 'blue' ? 'bg-blue-500/20' :
                                        'bg-gray-500/20'
                                      }`}>
                                        {statusIcon}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-bold text-lg line-clamp-2 mb-1">{voting.name}</h3>
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                          statusColor === 'green' ? 'bg-green-500/20 text-green-600' :
                                          statusColor === 'blue' ? 'bg-blue-500/20 text-blue-600' :
                                          'bg-gray-500/20 text-gray-600'
                                        }`}>
                                          {statusIcon}
                                          {statusText}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div className="space-y-1">
                                        <p className="text-muted-foreground">💰 Deposit</p>
                                        <p className="font-semibold">{voting.depositAmount} USDC</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-muted-foreground">
                                          {isActive ? '⏰ Ends' : isUpcoming ? '🚀 Starts' : '📅 Ended'}
                                        </p>
                                        <p className="font-semibold">
                                          {new Date((isActive || isEnded ? voting.endTime : voting.startTime) * 1000).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date((isActive || isEnded ? voting.endTime : voting.startTime) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="pt-12 pb-12 text-center">
                          <div className="space-y-2">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                              <List className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium">No mind games found</p>
                            <p className="text-sm text-muted-foreground">
                              {searchTerm ? `No mind games match "${searchTerm}"` : "No mind games in this category"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Empty State - Only show if ALL categories are empty */}
                  {!listLoading && ongoingVotings.length === 0 && upcomingVotings.length === 0 && endedVotings.length === 0 && (
                    <Card className="border-2 mt-6">
                      <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-lg text-muted-foreground">No mind games found.</p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>

              {/* TAB 2: Vote - Voting Details & Options */}
              <TabsContent value="vote" className="space-y-6">
                {selectedVoting && votingData ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Voting Info Card */}
                    <Card className="border-2 border-primary">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-3xl font-bold mb-2">{votingData.name}</CardTitle>
                            <CardDescription className="text-lg">
                              Contract: 
                              <a 
                                href={`https://sepolia.etherscan.io/address/${selectedVoting}#code`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 underline ml-1 inline-flex items-center gap-1"
                              >
                                <code className="bg-muted px-2 py-1 rounded text-sm">{selectedVoting}</code>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedVoting(null);
                              setActiveTab("votings");
                            }}
                            className="shrink-0"
                          >
                            ← Back to Mind Games
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Total Pool</p>
                            <p className="text-2xl font-bold text-green-600">{votingData.totalVotingUSDC} USDC</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                              {votingData.votingStartTime <= Math.floor(Date.now() / 1000) ? "Time Remaining" : "Duration"}
                            </p>
                            <p className="text-xl font-semibold">
                              {(() => {
                                const now = Math.floor(Date.now() / 1000);
                                if (votingData.votingStartTime > now) {
                                  // Voting hasn't started
                                  const duration = votingData.votingEndTime - votingData.votingStartTime;
                                  return formatTime(duration);
                                } else if (votingData.timeRemaining > 0) {
                                  // Voting in progress
                                  return formatTime(votingData.timeRemaining);
                                } else {
                                  // Voting ended
                                  return "Ended";
                                }
                              })()}
                            </p>
                            {votingData.votingStartTime > Math.floor(Date.now() / 1000) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Starting in: {formatTime(votingData.votingStartTime - Math.floor(Date.now() / 1000))}
                              </p>
                            )}
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Your Status</p>
                            <p className="text-lg font-semibold">
                              {votingData.hasVoted ? "✅ Voted" : "⏳ Not Voted"}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Results</p>
                            <p className="text-lg font-semibold">
                              {votingData.resultsRevealed ? "✅ Revealed" : "🔒 Hidden"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Voting Options Card - Only show when results are not revealed */}
                    {!votingData.resultsRevealed && (
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Vote className="h-5 w-5" />
                            Mind Game Options
                          </CardTitle>
                          <CardDescription>
                            {votingData.hasVoted 
                              ? "You have already cast your vote" 
                              : "Select an option to cast your vote"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[0, 1, 2].map((option) => {
                            const optionInfo = getOptionInfo(option);
                            
                            return (
                              <motion.div
                                key={option}
                                whileHover={{ scale: !votingData.hasVoted && votingData.timeRemaining > 0 && votingData.votingStartTime <= Math.floor(Date.now() / 1000) ? 1.02 : 1 }}
                                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedOption === option ? "border-purple-500 bg-purple-500/10" : "border-border"
                                }`}
                                onClick={() => !votingData.hasVoted && votingData.timeRemaining > 0 && votingData.votingStartTime <= Math.floor(Date.now() / 1000) && setSelectedOption(option)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <span className="text-4xl">{optionInfo.emoji}</span>
                                    <div>
                                      <h3 className="text-xl font-bold">{optionInfo.label}</h3>
                                      <p className="text-sm text-muted-foreground">{optionInfo.description}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    )}

                    {/* Results Revealed Card */}
                    {votingData.resultsRevealed && votingData.votingResolved && (
                      <Card className="border-2 border-purple-500 bg-purple-500/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Voting Results
                          </CardTitle>
                          <CardDescription>
                            Final vote counts and reward distribution
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Vote Counts Summary */}
                          <div className="grid grid-cols-3 gap-4">
                            {[0, 1, 2].map((option) => {
                              const optionInfo = getOptionInfo(option);
                              const rankInfo = getRankInfo(option);
                              const voteCount = option === 0 ? votingData.votesA : option === 1 ? votingData.votesB : votingData.votesC;
                              const multiplier = option === votingData.minorityOption
                                ? votingData.minorityMultiplier
                                : option === votingData.middleOption
                                  ? votingData.middleMultiplier
                                  : votingData.majorityMultiplier;

                              return (
                                <div key={option} className={`p-4 rounded-lg border-2 ${rankInfo?.bgColor || ''}`}>
                                  <div className="text-center space-y-2">
                                    <div className="text-3xl">{optionInfo.emoji}</div>
                                    <div className="font-bold text-sm">{optionInfo.label}</div>
                                    <div className="text-2xl font-bold">{voteCount}</div>
                                    <div className="text-xs text-muted-foreground">votes</div>
                                    <div className={`font-semibold ${rankInfo?.color || ''}`}>
                                      {rankInfo?.emoji} {rankInfo?.label}
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {(multiplier / 100).toFixed(2)}x
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* User's Participation Status */}
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold mb-3">Your Participation</h3>
                            {votingData.hasVoted ? (
                              <div className="space-y-3">
                                {/* User's Vote */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Your Vote</p>
                                    <p className="text-lg font-bold">
                                      {votingData.voteDecrypted && votingData.userDecryptedVote !== undefined
                                        ? `${getOptionInfo(votingData.userDecryptedVote).emoji} ${getOptionInfo(votingData.userDecryptedVote).label}`
                                        : "Vote encrypted (awaiting decryption)"}
                                    </p>
                                  </div>
                                  {votingData.voteDecrypted && votingData.userDecryptedVote !== undefined && (
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <p className={`font-semibold ${getRankInfo(votingData.userDecryptedVote)?.color || 'text-gray-600'}`}>
                                        {getRankInfo(votingData.userDecryptedVote)?.label || 'Unknown'}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Reward Information */}
                                {votingData.voteDecrypted && votingData.userDecryptedVote !== undefined && (
                                  <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Potential Reward</p>
                                        <p className="text-lg font-bold text-green-600">
                                          {votingData.userRewardAmount?.toFixed(2)} USDC
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Claim Status</p>
                                        {votingData.hasClaimedReward ? (
                                          <p className="font-semibold text-green-600">✅ Claimed</p>
                                        ) : (
                                          <p className="font-semibold text-orange-600">⏳ Available</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">You did not participate in this voting</p>
                                <p className="text-sm text-muted-foreground mt-1">No rewards available</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {votingData.hasVoted && (
                            <>
                              {/* Decryption Button */}
                              {!votingData.voteDecrypted && (
                                <Button
                                  onClick={handleRequestDecryption}
                                  disabled={votingLoading}
                                  className="w-full"
                                  size="lg"
                                  variant="outline"
                                >
                                  {votingLoading ? "Requesting..." : "🔐 Request Vote Decryption"}
                                </Button>
                              )}

                              {/* Claim Reward Button */}
                              {votingData.voteDecrypted && votingData.userDecryptedVote !== undefined && !votingData.hasClaimedReward && (
                                <Button
                                  onClick={handleClaimReward}
                                  disabled={votingLoading}
                                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                                  size="lg"
                                >
                                  {votingLoading ? "Claiming..." : `💰 Claim ${votingData.userRewardAmount?.toFixed(2)} USDC Reward`}
                                </Button>
                              )}

                              {/* Already Claimed */}
                              {votingData.hasClaimedReward && (
                                <div className="p-4 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
                                  <p className="font-semibold text-green-600">✅ Reward Already Claimed</p>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Voting Not Started Yet */}
                    {votingData.votingStartTime > Math.floor(Date.now() / 1000) && (
                      <Card className="border-2 border-orange-500">
                        <CardContent className="pt-6 text-center">
                          <div className="space-y-3">
                            <Clock className="h-12 w-12 text-orange-500 mx-auto" />
                            <p className="font-semibold">⏰ Voting Has Not Started Yet</p>
                            <p className="text-sm text-muted-foreground">
                              This voting will start on {new Date(votingData.votingStartTime * 1000).toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    {!votingData.hasVoted && votingData.timeRemaining > 0 && votingData.votingStartTime <= Math.floor(Date.now() / 1000) && (
                      <Card className="border-2 border-purple-500">
                        <CardContent className="pt-6">
                          <Button 
                            onClick={handleVote}
                            disabled={selectedOption === null || votingLoading}
                            className="w-full"
                            size="lg"
                          >
                            {votingLoading ? "Processing..." : `Vote for ${selectedOption !== null ? getOptionInfo(selectedOption).label : "Option"}`}
                          </Button>
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            Your USDC balance: {usdcBalance} USDC
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Waiting for Results */}
                    {votingData.hasVoted && votingData.timeRemaining <= 0 && !votingData.resultsRevealed && (
                      <Card className="border-2 border-yellow-500">
                        <CardContent className="pt-6 text-center">
                          <div className="space-y-3">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent mx-auto" />
                            <p className="font-semibold">⏳ Waiting for Results to be Revealed</p>
                            <p className="text-sm text-muted-foreground">
                              The voting has ended. Results will be available soon.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ) : (
                  <Card className="border-2">
                    <CardContent className="pt-12 pb-12 text-center">
                      <p className="text-muted-foreground">Select a proposal from the list to view details</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* TAB 3: Create Proposal */}
              <TabsContent value="create" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {isWhitelisted ? (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Create New Proposal
                        </CardTitle>
                        <CardDescription>
                          Set up a new private voting session with custom parameters
                          <br />
                          <span className="text-sm mt-2 block">
                            Factory Contract: 
                            <a 
                              href="https://sepolia.etherscan.io/address/0x3741cee30e6cda6c666de42c41dc471ebc6b091d#code" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 underline ml-1 inline-flex items-center gap-1"
                            >
                              View on Etherscan <ExternalLink className="h-3 w-3" />
                            </a>
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Proposal Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g., ETH Price Prediction 2026"
                            value={votingName}
                            onChange={(e) => setVotingName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deposit">Vote Deposit Amount (USDC)</Label>
                          <Input
                            id="deposit"
                            type="number"
                            step="0.01"
                            placeholder="10"
                            value={voteDeposit}
                            onChange={(e) => setVoteDeposit(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Amount each participant must deposit to vote
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="datetime-local"
                            value={votingStartTime}
                            onChange={(e) => setVotingStartTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duration">Voting Duration (seconds)</Label>
                          <Input
                            id="duration"
                            type="number"
                            placeholder="300"
                            min="300"
                            value={votingDuration}
                            onChange={(e) => setVotingDuration(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum: 300 (5 min) • 3600 = 1 hour • 86400 = 1 day • 604800 = 1 week
                          </p>
                        </div>

                        {/* Voting Options Configuration */}
                        <div className="space-y-4 pt-4 border-t">
                          <Label className="text-base font-semibold">Configure Voting Options</Label>

                          {/* Option A */}
                          <div className="space-y-2 p-4 border rounded-lg">
                            <Label className="font-semibold">Option A</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                placeholder="🎯"
                                value={optionA.emoji}
                                onChange={(e) => setOptionA({...optionA, emoji: e.target.value})}
                                className="text-center"
                                maxLength={2}
                              />
                              <Input
                                placeholder="Label"
                                value={optionA.label}
                                onChange={(e) => setOptionA({...optionA, label: e.target.value})}
                              />
                              <Input
                                placeholder="Description"
                                value={optionA.description}
                                onChange={(e) => setOptionA({...optionA, description: e.target.value})}
                                className="col-span-1"
                              />
                            </div>
                          </div>

                          {/* Option B */}
                          <div className="space-y-2 p-4 border rounded-lg">
                            <Label className="font-semibold">Option B</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                placeholder="🚀"
                                value={optionB.emoji}
                                onChange={(e) => setOptionB({...optionB, emoji: e.target.value})}
                                className="text-center"
                                maxLength={2}
                              />
                              <Input
                                placeholder="Label"
                                value={optionB.label}
                                onChange={(e) => setOptionB({...optionB, label: e.target.value})}
                              />
                              <Input
                                placeholder="Description"
                                value={optionB.description}
                                onChange={(e) => setOptionB({...optionB, description: e.target.value})}
                                className="col-span-1"
                              />
                            </div>
                          </div>

                          {/* Option C */}
                          <div className="space-y-2 p-4 border rounded-lg">
                            <Label className="font-semibold">Option C</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                placeholder="📉"
                                value={optionC.emoji}
                                onChange={(e) => setOptionC({...optionC, emoji: e.target.value})}
                                className="text-center"
                                maxLength={2}
                              />
                              <Input
                                placeholder="Label"
                                value={optionC.label}
                                onChange={(e) => setOptionC({...optionC, label: e.target.value})}
                              />
                              <Input
                                placeholder="Description"
                                value={optionC.description}
                                onChange={(e) => setOptionC({...optionC, description: e.target.value})}
                                className="col-span-1"
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleCreateVoting}
                          disabled={createLoading || !votingName || !votingStartTime}
                          size="lg"
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          {createLoading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Award className="mr-2 h-4 w-4" />
                              Create Proposal
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-2 border-red-500/50">
                      <CardContent className="pt-12 pb-12 text-center">
                        <div className="space-y-4">
                          <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="h-8 w-8 text-red-500" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Not Whitelisted</h3>
                            <p className="text-muted-foreground">
                              You are not whitelisted to create new proposals. Only whitelisted addresses can create Zama Mind Games.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Factory Contract: 
                              <a 
                                href="https://sepolia.etherscan.io/address/0x3741cee30e6cda6c666de42c41dc471ebc6b091d#code" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 underline ml-1 inline-flex items-center gap-1"
                              >
                                View on Etherscan <ExternalLink className="h-3 w-3" />
                              </a>
                            </p>
                          </div>
                          <Button
                            onClick={checkWhitelist}
                            variant="outline"
                            className="mt-4"
                          >
                            Check Status Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Info Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-sm">ℹ️ How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>• Participants vote by depositing USDC and selecting an encrypted option</p>
                      <p>• After voting ends, results are revealed through FHE decryption</p>
                      <p>• Rewards are distributed based on voting patterns (minority wins!)</p>
                      <p>• All votes remain encrypted until the round ends</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* TAB 4: Rules & Mint */}
              <TabsContent value="info" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Rules Section */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Game Rules
                      </CardTitle>
                      <CardDescription>
                        How Zama Mind Games work
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">💰 Deposit Requirement</h4>
                          <p className="text-sm text-muted-foreground">
                            Each participant must deposit 10 USDC to vote. This creates the prize pool and ensures commitment.
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">🔒 Fully Homomorphic Encryption (FHE)</h4>
                          <p className="text-sm text-muted-foreground">
                            All votes are encrypted using Zama&apos;s FHE technology. Votes remain private until the voting period ends.
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">⏰ Voting Resolution</h4>
                          <p className="text-sm text-muted-foreground">
                            After voting ends, results are decrypted and revealed. The system determines winners based on voting patterns.
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">🏆 Reward Distribution</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Rewards are distributed based on voting outcomes:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• <strong>Minority winner:</strong> 200% return (2x multiplier)</li>
                            <li>• <strong>Middle position:</strong> 100% return (1x multiplier)</li>
                            <li>• <strong>Majority loser:</strong> 0% return (forfeit deposit)</li>
                            <li>• <strong>Tie scenarios:</strong> Special multipliers apply</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">🔄 Protocol Fee & Surplus</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Fee structure and surplus distribution:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• <strong>Protocol fee:</strong> 2% goes to treasury</li>
                            <li>• <strong>Surplus distribution:</strong> 0-5% to treasury, rest to wheel pool</li>
                            <li>• <strong>Wheel pool:</strong> Redistributed to previous losers (weighted by losses)</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mint MockUSDC Section */}
                  <Card className="border-2 border-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Mint Mock USDC
                          </CardTitle>
                          <CardDescription>Get free test USDC to participate in Zama Mind Games</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">{usdcBalance}</p>
                          <p className="text-sm text-muted-foreground">USDC Balance</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleMintUSDC}
                        disabled={votingLoading}
                        className="w-full"
                        variant="outline"
                      >
                        {votingLoading ? "Minting..." : "🪙 Mint 1000 Mock USDC (Free)"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Mint test tokens on Sepolia testnet for Zama Mind Games participation
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>


            </Tabs>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="max-w-md mx-auto"
          >
            <Card className="border-2">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Connect wallet to start voting</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Make sure your wallet is on the Sepolia testnet and that you have ETH to pay for gas.
                </p>
                <Button onClick={handleConnectWallet} size="lg" className="w-full">
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Status Bar at Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto mt-8 mb-4"
        >
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${instance ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span>{status}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}