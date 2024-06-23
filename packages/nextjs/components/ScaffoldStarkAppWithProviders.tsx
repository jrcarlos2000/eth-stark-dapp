"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import {
  StarknetConfig,
  argent,
  braavos,
  useInjectedConnectors,
  starkscan,
} from "@starknet-react/core";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { ProgressBar } from "~~/components/scaffold-stark/ProgressBar";
import { appChains } from "~~/services/web3/connectors";
import { BurnerConnector } from "~~/services/web3/stark-burner/BurnerConnector";
import provider from "~~/services/web3/provider";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-stark/useNativeCurrencyPrice";
import { useMessaging } from "~~/hooks/scaffold-stark/useMessaging";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { BlockieAvatar } from "./scaffold-stark";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { StarknetWalletConnectors } from "@dynamic-labs/starknet";

// tanstack react query config
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
  useNativeCurrencyPrice();
  useInitializeNativeCurrencyPrice();
  useMessaging();
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <main className="relative flex flex-col flex-1">{children}</main>
      </div>
      <Toaster />
    </>
  );
};
export const ScaffoldStarkAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [argent(), braavos(), new BurnerConnector()],
    order: "random",
  });

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContextProvider
        settings={{
          environmentId: "eef08463-9eee-4347-a203-81006446159f",
          initialAuthenticationMode: "connect-only",
          walletConnectors: [
            EthereumWalletConnectors,
            StarknetWalletConnectors,
          ],
          bridgeChains: [
            {
              chain: "EVM",
            },
            {
              chain: "STARK",
            },
          ],
        }}
      >
        <StarknetConfig
          chains={appChains}
          provider={provider}
          connectors={connectors}
          explorer={starkscan}
        >
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider
              avatar={BlockieAvatar}
              theme={
                mounted
                  ? isDarkMode
                    ? darkTheme()
                    : lightTheme()
                  : lightTheme()
              }
            >
              <ProgressBar />
              <ScaffoldStarkApp>{children}</ScaffoldStarkApp>
            </RainbowKitProvider>
          </WagmiProvider>
        </StarknetConfig>
      </DynamicContextProvider>
    </QueryClientProvider>
  );
};
