'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import SumsubWebSdk from '@sumsub/websdk-react';
import { SiweMessage } from 'siwe';

function deriveKycState(applicant) {
  // According to Sumsub docs: https://docs.sumsub.com/docs/receive-and-interpret-results-via-api
  const rs = applicant?.reviewStatus || applicant?.review?.reviewStatus; // 'init' | 'pending' | 'completed' | 'onHold' | ...
  const ans = applicant?.reviewResult?.reviewAnswer || applicant?.review?.reviewResult?.reviewAnswer; // 'GREEN' | 'RED' | undefined
  const rejectType = applicant?.reviewResult?.reviewRejectType || applicant?.review?.reviewResult?.reviewRejectType; // 'FINAL' | 'RETRY'

  console.log("Deriving KYC state:", { rs, ans, rejectType, fullApplicant: applicant });

  // Check for completed status first
  if (rs === "completed") {
    if (ans === "GREEN") return "approved";
    if (ans === "RED") {
      // Check rejection type
      if (rejectType === "RETRY") return "resubmission_required";
      return "rejected"; // FINAL rejection
    }
    return "rejected"; // completed but not GREEN or RED
  }

  // Handle onHold status (requires attention)
  if (rs === "onHold") return "pending";

  // Handle pending/init states
  if (rs === "pending" || rs === "init") return "in_progress";

  // Fallback: check for resubmission indicators
  const needsMore = applicant?.moderationStatus === "RETRY" || applicant?.review?.moderationStatus === "RETRY"
                 || (applicant?.requiredIdDocs?.length || 0) > 0
                 || rejectType === "RETRY";
  if (needsMore) return "resubmission_required";

  return "in_progress";
}

function extractPII(applicant) {
  const p = applicant?.fixedInfo || applicant?.info || {};
  return {
    firstName: p.firstName || "",
    lastName:  p.lastName  || "",
    dob:       p.dob       || "",
    country:   p.country   || p.countryOfResidence || ""
  };
}

export default function KYCRegisterPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();
  const [kycStatus, setKycStatus] = useState('not_started');
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [applicantId, setApplicantId] = useState(null);
  const [fheInstance, setFheInstance] = useState(null);
  const [encryptedPII, setEncryptedPII] = useState(null);
  const [piiData, setPiiData] = useState(null);
  const [showPII, setShowPII] = useState(false);

  // Initialize Zama FHE
  useEffect(() => {
    const initFHE = async () => {
      try {
        // Load Zama FHE SDK dynamically
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
          const timeout = setTimeout(() => reject(new Error("FHE SDK timeout")), 15000);
          window.addEventListener('zama-sdk-ready', () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });

        const { initSDK, createInstance, SepoliaConfig } = window.ZamaSDK;
        await initSDK();

        // Create FHE instance
        const config = { ...SepoliaConfig };
        if (window.ethereum) {
          config.network = window.ethereum;
        }
        const instance = await createInstance(config);
        setFheInstance(instance);
      } catch (error) {
        console.error('Failed to initialize FHE:', error);
      }
    };

    initFHE();
  }, []);

  const refreshFromServer = useCallback(async (showErrors = false) => {
    try {
      const r = await fetch("/api/sumsub/applicant-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalUserId: address }) // send checksummed address
      });
      const txt = await r.text();
      if (!r.ok) {
        if (showErrors) alert(`Applicant lookup ${r.status}:\n${txt}`);
        console.error("applicant-data failed", r.status, txt);
        return;
      }
      const applicant = JSON.parse(txt);
      const state = deriveKycState(applicant);
      console.log("Setting KYC status to", state, "for applicant", applicant.id);
      setKycStatus(state);

      // always prepare PII (you can choose to display only on button click)
      const pii = extractPII(applicant);
      setPiiData(pii);

      return { applicant, state, pii };
    } catch (e) {
      if (showErrors) alert("Failed to fetch applicant data");
      console.error("refreshFromServer error", e);
    }
  }, [address]);

  // Reset KYC states when wallet address changes
  useEffect(() => {
    if (address) {
      setKycStatus('not_started');
      setLoading(false);
      setAccessToken(null);
      setApplicantId(null);
      setEncryptedPII(null);
      setPiiData(null);
      setShowPII(false);
    }
  }, [address]);

  const handleMessage = (type, payload) => {
    console.log("onMessage", type, payload);

    if (type === 'idCheck.onApplicantLoaded') {
      setApplicantId(payload.applicantId);
    } else if (type === 'idCheck.onApplicantStatusChanged') {
      const { reviewStatus, reviewResult } = payload;
      if (reviewStatus === 'completed') {
        if (reviewResult?.reviewAnswer === 'GREEN') {
          setKycStatus('approved');
          revealPII();
        } else if (reviewResult?.reviewAnswer === 'RED') {
          // Check rejection type according to Sumsub docs
          if (reviewResult?.reviewRejectType === 'RETRY') {
            setKycStatus('resubmission_required');
          } else {
            setKycStatus('rejected');
          }
        } else {
          setKycStatus('rejected');
        }
      } else if (reviewStatus === 'pending') {
        setKycStatus('in_progress');
      } else if (reviewStatus === 'onHold') {
        setKycStatus('pending');
      }
    }
  };

  const getNewAccessToken = async () => {
    try {
      const response = await fetch('/api/sumsub/access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get new access token');
      }

      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error('Error getting new access token:', error);
      throw error;
    }
  };

  const startKYC = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Get nonce for SIWE
      const nonceResponse = await fetch('/api/auth/nonce');
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }
      const { nonce } = await nonceResponse.json();

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to ZamaHub to start KYC process',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });

      // Sign the message
      const messageToSign = message.prepareMessage();
      const signature = await signMessageAsync({ message: messageToSign });

      // Request access token with SIWE verification
      const response = await fetch('/api/sumsub/access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: address,
          message: messageToSign,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const { token, applicantId: id } = await response.json();
      setAccessToken(token);
      setApplicantId(id || address); // Use address as fallback if applicantId not returned
    } catch (error) {
      console.error('Error starting KYC:', error);
      alert('Failed to start KYC process');
    } finally {
      setLoading(false);
    }
  };

  async function revealPII() {
    try {
      const response = await fetch('/api/pii/self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      });
      if (!response.ok) {
        throw new Error('Failed to reveal PII');
      }
      const { pii } = await response.json();
      setPiiData(pii);
      setShowPII(true);

      // optional FHE toy-encrypt as you had
      if (fheInstance) {
        const encryptedData = {};
        for (const [k, v] of Object.entries(pii)) {
          if (v) {
            const hash = String(v).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
            encryptedData[k] = fheInstance.encrypt32(hash);
          }
        }
        setEncryptedPII(encryptedData);
      }
    } catch (error) {
      console.error('Error revealing PII:', error);
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">KYC Registration</h1>

      {!isConnected && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Please connect your wallet to start KYC verification.
        </div>
      )}

      <div className="mb-4">
        <p>Status: <span className="font-semibold">{kycStatus.replace('_', ' ')}</span></p>
        {(kycStatus === 'approved' || kycStatus === 'rejected' || kycStatus === 'resubmission_required') && !showPII && (
          <button
            onClick={revealPII}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-4"
          >
            Reveal PII
          </button>
        )}
      </div>

      {showPII && piiData && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <h3 className="font-bold mb-2">Your PII Data</h3>
          <p className="mb-2">Your personally identifiable information from KYC verification:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(piiData, null, 2)}
          </pre>
        </div>
      )}

      {encryptedPII && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold mb-2">KYC Completed - Encrypted PII Ready</h3>
          <p className="mb-2">Your PII has been encrypted using Zama FHE and is ready for smart contract registration:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(encryptedPII, null, 2)}
          </pre>
          <p className="mt-2 text-sm">
            <strong>Next step:</strong> Call smart contract registration function with this encrypted data to prevent double KYC.
          </p>
        </div>
      )}

      <button
        onClick={startKYC}
        disabled={!isConnected || loading || accessToken}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Starting KYC...' : 'Start KYC Verification'}
      </button>

      {accessToken && (
        <SumsubWebSdk
          accessToken={accessToken}
          expirationHandler={getNewAccessToken}
          config={{ lang: 'en', theme: 'dark' }}
          options={{ addViewportTag: false, adaptIframeHeight: true }}
          onMessage={handleMessage}
          onError={(error) => console.error('Sumsub error:', error)}
        />
      )}
    </div>
  );
}
