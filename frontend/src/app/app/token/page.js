"use client";
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

// Import the MockGovernanceToken ABI
import MockGovernanceTokenAbi from '@/abis/MockGovernanceToken.json';

// Contract addresses from environment
const MOCK_GOVERNANCE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOCK_GOVERNANCE_TOKEN_ADDRESS;

export default function TokenPage() {
  const { address, isConnected } = useAccount();
  const [mintAmountInput, setMintAmountInput] = useState('1000');
  const [delegateAddressInput, setDelegateAddressInput] = useState('');
  const [delegations, setDelegations] = useState([]);

  // Token mint interaction
  const { writeContract: mintToken, data: mintTxHash, isPending: isMintPending, error: mintError } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: mintTxSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  // Token delegate interaction
  const { writeContract: delegateToken, data: delegateTxHash, isPending: isDelegatePending, error: delegateError } = useWriteContract();
  const { isLoading: isDelegateConfirming, isSuccess: delegateTxSuccess } = useWaitForTransactionReceipt({
    hash: delegateTxHash,
  });

  // Read current delegatee
  const { data: currentDelegatee, isLoading: delegateeLoading } = useReadContract({
    address: MOCK_GOVERNANCE_TOKEN_ADDRESS,
    abi: MockGovernanceTokenAbi.abi,
    functionName: 'delegates',
    args: [address],
    enabled: !!address && !!MOCK_GOVERNANCE_TOKEN_ADDRESS,
  });

  // Read token balance
  const { data: tokenBalance, isLoading: balanceLoading } = useReadContract({
    address: MOCK_GOVERNANCE_TOKEN_ADDRESS,
    abi: MockGovernanceTokenAbi.abi,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!MOCK_GOVERNANCE_TOKEN_ADDRESS,
  });

  // Mint MockGovernanceToken
  const handleMintToken = async () => {
    if (!address || !mintAmountInput) return;
    const amount = parseInt(mintAmountInput);
    if (isNaN(amount) || amount <= 0) return;
    mintToken({
      address: MOCK_GOVERNANCE_TOKEN_ADDRESS,
      abi: MockGovernanceTokenAbi.abi,
      functionName: 'mint',
      args: [address, amount],
    });
  };

  // Delegate MockGovernanceToken
  const handleDelegateToken = async () => {
    if (!delegateAddressInput) return;
    // Note: Standard delegation delegates all voting power
    delegateToken({
      address: MOCK_GOVERNANCE_TOKEN_ADDRESS,
      abi: MockGovernanceTokenAbi.abi,
      functionName: 'delegate',
      args: [delegateAddressInput],
    });
  };

  // Undelegate MockGovernanceToken (delegate to self)
  const handleUndelegateToken = async () => {
    if (!address) return;
    delegateToken({
      address: MOCK_GOVERNANCE_TOKEN_ADDRESS,
      abi: MockGovernanceTokenAbi.abi,
      functionName: 'delegate',
      args: [address], // Delegate to self to undelegate
    });
  };

  // Query client for invalidation
  const queryClient = useQueryClient();

  // Refresh data after successful transaction
  useEffect(() => {
    if (mintTxSuccess) {
      // Invalidate balance query
      queryClient.invalidateQueries(['wagmi', 'readContract', { address: MOCK_GOVERNANCE_TOKEN_ADDRESS, functionName: 'balanceOf', args: [address] }]);
    }
    if (delegateTxSuccess) {
      // Invalidate delegatee query
      queryClient.invalidateQueries(['wagmi', 'readContract', { address: MOCK_GOVERNANCE_TOKEN_ADDRESS, functionName: 'delegates', args: [address] }]);
      // Add to delegations if delegating to someone else
      if (delegateAddressInput && delegateAddressInput.toLowerCase() !== address?.toLowerCase()) {
        setDelegations(prev => [...prev, { address: delegateAddressInput, amount: tokenBalance }]);
      }
    }
  }, [mintTxSuccess, delegateTxSuccess, queryClient, address, delegateAddressInput, tokenBalance]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access token functionality.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E8DCC4]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black">MockGovernanceToken</h1>
            <p className="text-black mt-2">
              Manage your governance tokens for voting in ZamaHub spaces.
            </p>
          </div>

          {/* Token Balance Card */}
          <Card className="bg-white/80 border-[#E8DCC4]/30">
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
              <CardDescription>
                Your current MockGovernanceToken balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {balanceLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <div className="text-3xl font-bold text-black">
                    {tokenBalance ? tokenBalance.toString() : '0'} <span className="text-lg text-[#4D89B0]/70">MGT</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mint Tokens Card */}
          <Card className="bg-white/80 border-[#E8DCC4]/30">
            <CardHeader>
              <CardTitle>Mint Tokens</CardTitle>
              <CardDescription>
                Mint new MockGovernanceToken for testing purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount to mint"
                    value={mintAmountInput}
                    onChange={(e) => setMintAmountInput(e.target.value)}
                    className="flex-1 border border-[#E8DCC4]/30 rounded px-3 py-2 bg-white/50"
                    min="1"
                  />
                  <Button
                    onClick={handleMintToken}
                    disabled={isMintPending || isMintConfirming}
                    className="bg-[#4D89B0] hover:bg-[#4D89B0]/90 text-white"
                  >
                    {isMintPending || isMintConfirming ? 'Minting...' : 'Mint'}
                  </Button>
                </div>
                {mintError && (
                  <p className="text-sm text-red-600">{mintError.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delegate Voting Power Card */}
          <Card className="bg-white/80 border-[#E8DCC4]/30">
            <CardHeader>
              <CardTitle>Delegate Voting Power</CardTitle>
              <CardDescription>
                Delegate your voting power to another address or undelegate to vote yourself.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-black mb-2">Current Delegatee:</p>
                  <p className="text-sm text-[#4D89B0]/70">
                    {delegateeLoading ? 'Loading...' : (currentDelegatee && currentDelegatee !== '0x0000000000000000000000000000000000000000' ? (currentDelegatee.toLowerCase() === address?.toLowerCase() ? 'Self Delegated' : currentDelegatee) : 'None')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="0xDelegateAddress"
                    value={delegateAddressInput}
                    onChange={(e) => setDelegateAddressInput(e.target.value)}
                    className="flex-1 border border-[#E8DCC4]/30 rounded px-3 py-2 bg-white/50"
                  />
                  <Button
                    onClick={handleDelegateToken}
                    disabled={isDelegatePending || isDelegateConfirming}
                    className="border-[#4D89B0] text-black hover:bg-[#4D89B0] hover:text-white"
                  >
                    {isDelegatePending || isDelegateConfirming ? 'Delegating...' : 'Delegate'}
                  </Button>
                  <Button
                    onClick={handleUndelegateToken}
                    disabled={isDelegatePending || isDelegateConfirming}
                    className="border-[#4D89B0] text-black hover:bg-[#4D89B0] hover:text-white"
                  >
                    {isDelegatePending || isDelegateConfirming ? 'Undelegating...' : 'Undelegate'}
                  </Button>
                </div>

                {delegateError && (
                  <p className="text-sm text-red-600">{delegateError.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Past Delegations Card */}
          <Card className="bg-white/80 border-[#E8DCC4]/30">
            <CardHeader>
              <CardTitle>Past Delegations</CardTitle>
              <CardDescription>
                History of your delegation actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {delegations.length > 0 ? (
                <ul className="space-y-2">
                  {delegations.map((d, i) => (
                    <li key={i} className="flex justify-between items-center p-3 bg-[#E8DCC4]/10 rounded border border-[#E8DCC4]/30">
                      <span className="text-sm text-black">
                        Delegated {d.amount ? d.amount.toString() : '0'} tokens to {d.address.toLowerCase() === address?.toLowerCase() ? 'Self' : d.address}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#4D89B0]/70 text-center py-4">No past delegations</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
