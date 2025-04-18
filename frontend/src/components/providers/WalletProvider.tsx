'use client';

import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { memo } from 'react';
import '@rainbow-me/rainbowkit/styles.css';

// Move these outside component to ensure single initialization
const queryClient = new QueryClient();

const abstractChain = {
  id: 11124,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://api.testnet.abs.xyz'] },
    public: { http: ['https://api.testnet.abs.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Abstract Explorer', url: 'https://explorer.testnet.abs.xyz' },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'Swear Jar',
  projectId: 'dummy-project-id',
  chains: [abstractChain],
  transports: {
    [abstractChain.id]: http(),
  },
});

function BaseWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00FF00', // Primary color from your Tailwind config
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export const WalletProvider = memo(BaseWalletProvider); 