'use client';

import { RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig } from 'wagmi';
import { createClient, http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { memo } from 'react';
import { abstractWallet } from '@abstract-foundation/agw-react/connectors';
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

const connectors = connectorsForWallets([
  {
    groupName: "Abstract",
    wallets: [abstractWallet]
  }
], {
  appName: "Swear Jar",
  projectId: "",
});

const config = createConfig({
  connectors,
  chains: [abstractChain],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    });
  },
  ssr: true,
});

const customTheme = {
  ...darkTheme(),
  colors: {
    ...darkTheme().colors,
    accentColor: '#00FF8C',
    accentColorForeground: '#000000',
    connectButtonBackground: '#1A1A1A',
    connectButtonInnerBackground: '#0A0A0A',
    connectButtonText: '#FFFFFF',
    modalBackground: '#1A1A1A',
    modalText: '#FFFFFF',
    modalTextSecondary: '#CCCCCC',
    modalBackdrop: 'rgba(0, 0, 0, 0.8)',
  },
  radii: {
    ...darkTheme().radii,
    connectButton: '12px',
    modal: '16px',
  },
  fonts: {
    ...darkTheme().fonts,
    body: 'inherit'
  }
};

function BaseWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider theme={customTheme}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export const WalletProvider = memo(BaseWalletProvider); 