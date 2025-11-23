'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useWalletClient, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import { initializeFheInstance, createEncryptedInput, decryptMultipleHandles, createEncryptedPercentages } from '@/lib/fhevm';
import { useProposalById } from '@/hooks/useSubgraph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import PrivateProposalABI from '@/abis/PrivateProposal.json';

// Helper function to format time
const formatTime = (seconds) => {
  if (seconds <= 0) return '0m';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${mins}m`;
};

export default function ProposalVotePage() {
  const params = useParams();
  const { space_name, proposal_id } = params;
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState(null);
  const [fheInitialized, setFheInitialized] = useState(false);
  const [voting, setVoting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [percentages, setPercentages] = useState({});
  const [results, setResults] = useState(null);
  const [resultsRevealed, setResultsRevealed] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Use proposal_id directly as bytes32 for subgraph
  const proposalIdBytes32 = proposal_id;

  const { data: proposalData, isLoading, error } = useProposalById(proposalIdBytes32);

  const proposal = proposalData?.proposalCreateds?.[0];
  const pType = proposal?.p_pType || 0;
  const eligibilityToken = proposal?.p_eligibilityToken;

  // Time calculations
  const currentTime = Math.floor(Date.now() / 1000);
  const pStart = proposal?.p_start ? Number(proposal.p_start) : 0;
  const pEnd = proposal?.p_end ? Number(proposal.p_end) : 0;
  const isBeforeStart = currentTime < pStart;
  const isDuring = currentTime >= pStart && currentTime < pEnd;
  const isAfter = currentTime >= pEnd;
  const status = isBeforeStart ? 'Upcoming' : isDuring ? 'Active' : 'Ended';
  const timeSinceStart = isBeforeStart ? 'Not started' : formatTime(currentTime - pStart);
  const timeRemaining = isAfter ? 'Ended' : formatTime(pEnd - currentTime);

  // Get voting power
  const { data: votingPowerData } = useReadContract({
    address: eligibilityToken,
    abi: [
      {
        "constant": true,
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "getVotes",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
      }
    ],
    functionName: 'getVotes',
    args: [address],
    enabled: !!eligibilityToken && !!address && pType > 0
  });

  // Check if user has voted
  const { data: hasVotedData } = useReadContract({
    address: proposal?.proposal,
    abi: PrivateProposalABI.abi,
    functionName: 'hasVoted',
    args: [address],
    enabled: !!proposal?.proposal && !!address
  });

  const votingPower = pType === 0 ? 1 : (votingPowerData ? Number(votingPowerData) : 0);
  const isEligible = pType === 0 || votingPower > 0;
  const totalPercentage = Object.values(percentages).reduce((sum, val) => sum + (parseInt(val) || 0), 0);

  // Update hasVoted state
  useEffect(() => {
    if (hasVotedData !== undefined) {
      setHasVoted(hasVotedData);
    }
  }, [hasVotedData]);

  // Create signer from wallet client
  useEffect(() => {
    const createSigner = async () => {
      if (walletClient) {
        const provider = new ethers.BrowserProvider(walletClient.transport);
        const ethersSigner = await provider.getSigner();
        setSigner(ethersSigner);
      } else {
        setSigner(null);
      }
    };
    createSigner();
  }, [walletClient]);

  // Initialize FHE instance
  useEffect(() => {
    const initFHE = async () => {
      try {
        await initializeFheInstance();
        setFheInitialized(true);
      } catch (error) {
        console.error('FHE initialization failed:', error);
      }
    };
    initFHE();
  }, []);

  // Get proposal contract address from subgraph
  const getProposalAddress = () => {
    if (!proposal) return null;
    return proposal.proposal;
  };

  // Fetch results from contract
  const fetchResults = useCallback(async () => {
    if (!signer || !proposal) return;

    try {
      const proposalAddress = proposal.proposal;
      if (!proposalAddress) return;

      const proposalContract = new ethers.Contract(proposalAddress, PrivateProposalABI.abi, signer);

      const revealed = await proposalContract.resultsRevealed();
      setResultsRevealed(revealed);

      if (revealed) {
        const voteCounts = await proposalContract.getVotePercentages(); // Fetch vote counts
        const voteCountsBig = voteCounts.map(c => BigInt(c.toString()));
        const totalVotes = voteCountsBig.reduce((sum, count) => sum + count, 0n);
        const percentages = voteCountsBig.map(count => totalVotes > 0n ? Number((count * 100n) / totalVotes) : 0);
        const winningChoice = await proposalContract.winningChoice();
        const passed = await proposalContract.proposalPassed();
        const resolved = await proposalContract.proposalResolved();

        setResults({
          percentages: percentages.map(p => p.toString()),
          winningChoice: winningChoice.toString(),
          passed,
          resolved
        });
      } else {
        // Check if voting period has ended and decrypt results
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > proposal.p_end && fheInitialized) {
          // Get encrypted handles for each choice
          const handles = [];
          for (let i = 0; i < proposal.p_choices.length; i++) {
            const handle = await proposalContract.getEncryptedChoiceVotes(i);
            handles.push(handle);
          }

          // Decrypt the handles
          const { cleartexts, decryptionProof } = await decryptMultipleHandles(proposalAddress, signer, handles);

          // Compute results from decrypted vote counts
          const voteCounts = cleartexts.map(c => BigInt(c));
          const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0n);
          const percentages = voteCounts.map(count => totalVotes > 0n ? Number((count * 100n) / totalVotes) : 0);
          const maxVotes = Math.max(...voteCounts.map(c => Number(c)));
          const winningChoice = voteCounts.findIndex(c => Number(c) === maxVotes);

          // Submit to contract for on-chain verification
          const tx = await proposalContract.resolveProposalCallback(proposalAddress, cleartexts, decryptionProof);
          await tx.wait();

          // Fetch passed and resolved from contract
          const passed = await proposalContract.proposalPassed();
          const resolved = await proposalContract.proposalResolved();

          setResults({
            percentages: percentages.map(p => p.toString()),
            winningChoice: winningChoice.toString(),
            passed,
            resolved
          });
          setResultsRevealed(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  }, [signer, proposal, fheInitialized]);

  // Handle TallyRevealRequested event
  const handleTallyRevealRequested = useCallback(async (encryptedHandles) => {
    if (!signer || !proposal || !fheInitialized) return;

    try {
      const proposalAddress = proposal.proposal;
      const { cleartexts, decryptionProof } = await decryptMultipleHandles(proposalAddress, signer, encryptedHandles);

      // Submit to contract for on-chain verification
      const proposalContract = new ethers.Contract(proposalAddress, PrivateProposalABI.abi, signer);
      const tx = await proposalContract.resolveProposalCallback(proposalAddress, cleartexts, decryptionProof);
      await tx.wait();

      // Fetch the verified results from the contract
      await fetchResults();
    } catch (error) {
      console.error('Failed to decrypt and verify results:', error);
    }
  }, [signer, proposal, fheInitialized, fetchResults]);

  // Manual resolve proposal
  const handleResolveProposal = async () => {
    if (!signer || !proposal || !fheInitialized) return;

    setResolving(true);
    try {
      const proposalAddress = proposal.proposal;
      const proposalContract = new ethers.Contract(proposalAddress, PrivateProposalABI.abi, signer);

      // Get encrypted handles for each choice
      const handles = [];
      for (let i = 0; i < proposal.p_choices.length; i++) {
        const handle = await proposalContract.getEncryptedChoiceVotes(i);
        handles.push(handle);
      }

      // Decrypt the handles
      const { cleartexts, decryptionProof } = await decryptMultipleHandles(proposalAddress, signer, handles);

      // Submit to contract for on-chain verification
      const tx = await proposalContract.resolveProposalCallback(proposalAddress, cleartexts, decryptionProof);
      await tx.wait();

      // Fetch the verified results from the contract
      await fetchResults();
    } catch (error) {
      console.error('Failed to resolve proposal:', error);
      alert('Failed to resolve proposal: ' + error.message);
    } finally {
      setResolving(false);
    }
  };

  // Fetch results when proposal is loaded
  useEffect(() => {
    if (proposal && signer) {
      fetchResults();
    }
  }, [proposal, signer, fetchResults]);

  // Listen for TallyRevealRequested event
  useEffect(() => {
    if (!signer || !proposal) return;

    const proposalAddress = proposal.proposal;
    const proposalContract = new ethers.Contract(proposalAddress, PrivateProposalABI.abi, signer);

    // Set up event listener
    proposalContract.on('TallyRevealRequested', handleTallyRevealRequested);

    // Also check for past events
    const checkPastEvents = async () => {
      try {
        const filter = proposalContract.filters.TallyRevealRequested();
        const events = await proposalContract.queryFilter(filter);
        if (events.length > 0) {
          const lastEvent = events[events.length - 1];
          await handleTallyRevealRequested(...lastEvent.args);
        }
      } catch (error) {
        console.error('Failed to query past events:', error);
      }
    };

    checkPastEvents();

    return () => {
      proposalContract.off('TallyRevealRequested', handleTallyRevealRequested);
    };
  }, [signer, proposal, handleTallyRevealRequested]);

  // Vote function
  const handleVote = async (choiceIndex) => {
    if (!fheInitialized || !signer || !proposal) return;

    setVoting(true);
    try {
      const proposalAddress = getProposalAddress();
      if (!proposalAddress) {
        throw new Error('Could not get proposal address');
      }

      let tx;
      if (pType === 0) {
        // Non-weighted vote
        const encryptedInput = await createEncryptedInput(proposalAddress, address, choiceIndex);
        const proposalContract = new ethers.Contract(proposalAddress, PrivateProposalABI.abi, signer);
        tx = await proposalContract.vote_nonweighted(encryptedInput.encryptedData, encryptedInput.proof);
      } else if (pType === 1) {
        // Single weighted vote
        const encryptedInput = await createEncryptedInput(proposalAddress, address, choiceIndex);
        const proposalContract = new ethers.Contract(proposalAddress, PrivateProposalABI.abi, signer);
        tx = await proposalContract.vote_weighted_Single(encryptedInput.encryptedData, encryptedInput.proof);
      } else if (pType === 2) {
        // Fractional voting
        const percentageArray = proposal.p_choices.map((_, index) => percentages[index] || 0);
        const encryptedPercentages = await createEncryptedPercentages(proposalAddress, address, percentageArray);
        const proposalContract = new ethers.Contract(proposalAddress, PrivateProposalABI.abi, signer);
        tx = await proposalContract.vote_weighted_fractional(encryptedPercentages.encryptedInputs, encryptedPercentages.proof);
      } else {
        throw new Error('Unsupported proposal type');
      }
      await tx.wait();

      console.log('Vote submitted successfully');
      alert('Vote submitted successfully!');

      // Fetch results after voting
      await fetchResults();
    } catch (error) {
      console.error('Voting failed:', error);
      alert('Voting failed: ' + error.message);
    } finally {
      setVoting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/80 border-[#E8DCC4]/30">
            <CardHeader>
              <CardTitle className="text-black">Connect Wallet</CardTitle>
              <CardDescription className="text-black">Please connect your wallet to vote on proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectWallet />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-black">Loading proposal...</div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-black">Error loading proposal</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/80 border-[#E8DCC4]/30">
          <CardHeader>
            <CardTitle className="text-black">{proposal.p_title}</CardTitle>
            <CardDescription className="text-black">
              Proposal ID: {proposal.proposalId}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isBeforeStart ? "secondary" : isDuring ? "default" : "secondary"} className="bg-[#4D89B0] text-white">
                {status}
              </Badge>
              <span className="text-sm text-black">
                {isBeforeStart ? `Starts in ${timeRemaining}` : isDuring ? `Ends in ${timeRemaining}` : `Ended ${timeSinceStart} ago`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposal.p_description && (
                <div>
                  <strong className="text-black">Description:</strong> <a href={proposal.p_description} target="_blank" rel="noopener noreferrer" className="text-[#4D89B0] underline">{proposal.p_description}</a>
                </div>
              )}

              <div className="p-4 bg-[#4D89B0]/10 rounded-lg">
                <p className="text-sm text-black">
                  <strong>Your Voting Power:</strong> {pType === 0 ? '1 vote' : `${votingPower} tokens`}
                </p>
              </div>            <div>
              <h3 className="text-lg font-semibold mb-2 text-black">Choices:</h3>
              <div className="space-y-4">
                {proposal.p_choices?.map((choice, index) => (
                  <div key={index}>
                    {isDuring && !hasVoted && isEligible ? (
                      pType === 2 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-medium">{choice}</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={percentages[index] || ''}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                setPercentages({...percentages, [index]: val});
                              }}
                              className="w-20 px-2 py-1 border rounded text-center"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-black">%</span>
                          </div>
                          <div className="w-full bg-[#E8DCC4]/30 rounded-full h-2">
                            <div 
                              className="bg-[#4D89B0] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentages[index] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`choice-${index}`}
                            name="vote-choice"
                            value={index}
                            onChange={() => setSelectedChoice(index)}
                            checked={selectedChoice === index}
                          />
                          <label htmlFor={`choice-${index}`}>{choice}</label>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>{choice}</span>
                        {pType === 2 && percentages[index] && (
                          <span className="text-sm text-black">{percentages[index]}%</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {pType === 2 && isDuring && !hasVoted && isEligible && (
                <div className="mt-4 p-3 bg-[#E8DCC4]/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-black">Total Allocation:</span>
                    <span className={`font-bold ${totalPercentage === 100 ? 'text-[#4D89B0]' : 'text-red-600'}`}>
                      {totalPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-[#E8DCC4]/30 rounded-full h-3 mt-2">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        totalPercentage === 100 ? 'bg-[#4D89B0]' : totalPercentage > 100 ? 'bg-red-600' : 'bg-[#4D89B0]'
                      }`}
                      style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                    ></div>
                  </div>
                  {totalPercentage !== 100 && (
                    <p className="text-sm text-red-600 mt-1">
                      Percentages must sum to exactly 100%
                    </p>
                  )}
                </div>
              )}
            </div>

            {isBeforeStart ? (
              <div className="p-4 bg-[#E8DCC4]/20 rounded-lg">
                <p className="text-black">Voting has not started yet. You can see the options above.</p>
              </div>
            ) : isDuring ? (
              hasVoted ? (
                <div className="p-4 bg-[#4D89B0]/10 rounded-lg">
                  <p className="text-black">You have already voted.</p>
                </div>
              ) : isEligible ? (
                <Button
                  onClick={() => handleVote(pType === 2 ? null : selectedChoice)}
                  disabled={(pType !== 2 && selectedChoice === null) || (pType === 2 && totalPercentage !== 100) || voting || !fheInitialized}
                  className="w-full bg-[#4D89B0] hover:bg-[#4D89B0]/90 text-white"
                >
                  {voting ? 'Submitting Vote...' : 'Vote'}
                </Button>
              ) : (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-red-700">You are not eligible to vote.</p>
                </div>
              )
            ) : (
              <div>
                {resultsRevealed && results && (
                  <div className="mt-6 p-4 bg-[#E8DCC4]/10 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-black">Results</h3>
                    <div className="space-y-2">
                      <p className="text-black"><strong>Winning Choice:</strong> {proposal.p_choices?.[parseInt(results.winningChoice)]} (Index: {results.winningChoice})</p>
                      <p className="text-black"><strong>Proposal Passed:</strong> {results.passed ? 'Yes' : 'No'}</p>
                      <p className="text-black"><strong>Proposal Resolved:</strong> {results.resolved ? 'Yes' : 'No'}</p>
                      <div>
                        <strong className="text-black">Vote Percentages:</strong>
                        <ul className="list-disc list-inside mt-2">
                          {results.percentages.map((percentage, index) => (
                            <li key={index} className="text-black">
                              {proposal.p_choices?.[index]}: {percentage}%
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {!resultsRevealed && (
                  <div className="mt-6 p-4 bg-[#E8DCC4]/20 rounded-lg">
                    <p className="text-sm text-black">Results not yet revealed. They will be available after the voting period ends and decryption is completed, or you can click Resolve Proposal to manually decrypt and reveal results.</p>
                    <Button
                      onClick={handleResolveProposal}
                      disabled={resolving || !fheInitialized}
                      variant="outline"
                      className="w-full mt-4 border-[#4D89B0] text-black hover:bg-[#4D89B0] hover:text-white"
                    >
                      {resolving ? 'Resolving Proposal...' : 'Resolve Proposal'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!fheInitialized && (
              <div className="text-sm text-black">
                Initializing FHE encryption...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
