"use client";
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Import the SpaceRegistry ABI
import spaceRegistryAbi from '@/abis/SpaceRegistry.json';

// Contract addresses
const SPACE_REGISTRY_ADDRESS = '0x7579FDF957567e2Eb881A0B00a7cF5772A59759b';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function SpaceCreation() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [ensName, setEnsName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!ensName.trim()) {
      newErrors.ensName = 'ENS name is required';
    } else if (!ensName.endsWith('.eth')) {
      newErrors.ensName = 'ENS name must end with .eth';
    }

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.length > 30) {
      newErrors.displayName = 'Display name must be 30 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted');
    console.log('isConnected:', isConnected);
    console.log('ensName:', ensName);
    console.log('displayName:', displayName);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    if (!isConnected) {
      console.log('Wallet not connected');
      setErrors({ general: 'Please connect your wallet first' });
      return;
    }

    console.log('Calling writeContract...');
    writeContract({
      address: SPACE_REGISTRY_ADDRESS,
      abi: spaceRegistryAbi.abi,
      functionName: 'createSpace',
      args: [ensName, displayName, 0, ZERO_ADDRESS, 0],
    });
  };

  // Handle successful transaction
  useEffect(() => {
    console.log('Transaction status - hash:', hash, 'isSuccess:', isSuccess, 'isConfirming:', isConfirming);
    if (isSuccess && hash) {
      console.log('Space creation successful! Transaction hash:', hash);
      setSuccess(true);
      setErrors({});
    }
  }, [isSuccess, hash, isConfirming]);

  // Reset success state when transaction completes
  if (isSuccess && !success) {
    setSuccess(true);
  }

  if (!mounted || !isConnected) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Governance Space</CardTitle>
          <CardDescription>
            Create a decentralized governance space backed by ENS domain ownership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to create a space.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Governance Space</CardTitle>
        <CardDescription>
          Create a decentralized governance space backed by ENS domain ownership.
          You must own the ENS domain to create a space.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Space created successfully on the blockchain!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'An error occurred while creating the space.'}
            </AlertDescription>
          </Alert>
        )}

        {errors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ensName">ENS Domain *</Label>
            <Input
              id="ensName"
              type="text"
              placeholder="e.g., myspace.eth"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              className={errors.ensName ? 'border-red-500' : ''}
            />
            {errors.ensName && (
              <p className="text-sm text-red-600">{errors.ensName}</p>
            )}
            <p className="text-sm text-gray-600">
              You must own this ENS domain to create a space.{' '}
              <a
                href="/app/spaces/ens"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Register a new ENS name →
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="e.g., My Governance Space"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={errors.displayName ? 'border-red-500' : ''}
            />
            {errors.displayName && (
              <p className="text-sm text-red-600">{errors.displayName}</p>
            )}
            <p className="text-sm text-gray-600">
              Maximum 30 characters. This will be displayed in the UI.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Creating Space...' : 'Confirming...'}
                </>
              ) : (
                'Create Space'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}