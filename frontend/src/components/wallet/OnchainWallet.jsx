'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function OnchainWalletDemo() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-white text-black border border-black rounded-md px-4 py-2 hover:bg-gray-50 hover:scale-105 hover:shadow-md transition-all duration-200 font-medium active:scale-95"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-red-500 text-white border border-red-500 rounded-md px-4 py-2 hover:bg-red-600 hover:scale-105 hover:shadow-md transition-all duration-200 font-medium active:scale-95"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-white text-black border border-black rounded-md px-3 py-2 hover:bg-gray-50 hover:scale-105 hover:shadow-md transition-all duration-200 font-medium flex items-center gap-2 active:scale-95"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-white text-black border border-black rounded-md px-3 py-2 hover:bg-gray-50 hover:scale-105 hover:shadow-md transition-all duration-200 font-medium active:scale-95"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

// Export as OnchainWallet for consistency
export { OnchainWalletDemo as OnchainWallet };