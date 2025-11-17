"use client";
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { ethers } from 'ethers';

// Import the MockENS ABI
import mockENSABI from '@/abis/MockENS.json';

// Contract address for Sepolia
const MOCK_ENS_ADDRESS = '0x6649b08Be729538Bc290305040Cd6e18c1425428';

export default function ENSRegistrationPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [ensName, setEnsName] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Function to convert ENS name to bytes32 node hash
  const namehash = (name) => {
    if (!name) return ethers.ZeroHash;

    const labels = name.split('.');
    let node = ethers.ZeroHash;

    for (let i = labels.length - 1; i >= 0; i--) {
      const label = labels[i];
      if (label) {
        node = ethers.keccak256(
          ethers.concat([
            node,
            ethers.keccak256(ethers.toUtf8Bytes(label))
          ])
        );
      }
    }

    return node;
  };

  // Check if ENS name is available
  const checkAvailability = async () => {
    if (!ensName.trim()) return;

    setCheckingAvailability(true);
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org');
      const contract = new ethers.Contract(MOCK_ENS_ADDRESS, mockENSABI.abi, provider);

      const node = namehash(ensName);
      const owner = await contract.owner(node);

      setIsAvailable(owner === ethers.ZeroAddress);
    } catch (error) {
      console.error('Error checking availability:', error);
      setErrors({ general: 'Failed to check availability. Please try again.' });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!ensName.trim()) {
      newErrors.ensName = 'ENS name is required';
    } else if (!ensName.endsWith('.eth')) {
      newErrors.ensName = 'ENS name must end with .eth';
    } else if (ensName.split('.').length !== 2) {
      newErrors.ensName = 'ENS name must be in format: name.eth';
    } else if (ensName.length < 7) { // minimum: x.eth
      newErrors.ensName = 'ENS name is too short';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!isConnected) {
      setErrors({ general: 'Please connect your wallet first' });
      return;
    }

    if (isAvailable === false) {
      setErrors({ general: 'This ENS name is already taken' });
      return;
    }

    try {
      const node = namehash(ensName);

      writeContract({
        address: MOCK_ENS_ADDRESS,
        abi: mockENSABI.abi,
        functionName: 'setNodeOwner',
        args: [node, address],
      });
    } catch (err) {
      console.error('Error registering ENS:', err);
      setErrors({ general: 'Failed to register ENS name. Please try again.' });
    }
  };

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      setSuccess(true);
      setErrors({});
      setIsAvailable(false); // Mark as taken now
    }
  }, [isSuccess, hash]);

  // Reset success state when transaction completes
  if (isSuccess && !success) {
    setSuccess(true);
  }

  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to register ENS names.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Register ENS Name</h1>
              <p className="text-gray-600 mt-1">
                Register a .eth domain name for your governance spaces
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ENS Registration</CardTitle>
              <CardDescription>
                Register a unique .eth domain that you can use to create governance spaces.
                This uses a mock ENS contract on Sepolia testnet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ensName">ENS Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ensName"
                      type="text"
                      placeholder="myspace.eth"
                      value={ensName}
                      onChange={(e) => {
                        setEnsName(e.target.value);
                        setIsAvailable(null); // Reset availability check
                        setErrors({ ...errors, ensName: undefined });
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={checkAvailability}
                      disabled={!ensName.trim() || checkingAvailability}
                    >
                      {checkingAvailability ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Check'
                      )}
                    </Button>
                  </div>
                  {errors.ensName && (
                    <p className="text-sm text-red-600">{errors.ensName}</p>
                  )}
                  {isAvailable === true && (
                    <p className="text-sm text-green-600">✓ This name is available!</p>
                  )}
                  {isAvailable === false && (
                    <p className="text-sm text-red-600">✗ This name is already taken</p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your ENS name will be registered to your wallet address</li>
                    <li>• You can use this name to create governance spaces</li>
                    <li>• Registration is free on the Sepolia testnet</li>
                    <li>• Names are unique and cannot be changed once registered</li>
                  </ul>
                </div>

                {errors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Successfully registered {ensName}! You can now use this name to create spaces.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!mounted || isPending || isConfirming || isAvailable === false || !ensName.trim()}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Register ENS Name
                    </>
                  )}
                </Button>
              </form>

              {hash && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{hash}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}