import * as chains from "viem/chains";

export type ScaffoldEthConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  onlyLocalBurnerWallet: boolean;
  rpcProviderUrl: string;
  walletAutoConnect: boolean;
};

const scaffoldConfig = {
  targetNetworks: [chains.anvil],
  // Only show the Burner Wallet when running on devnet
  onlyLocalBurnerWallet: false,
  rpcProviderUrl: process.env.NEXT_PUBLIC_PROVIDER_URL || "",
  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 30_000)
  pollingInterval: 30_000,
  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  walletAutoConnect: true,
} as const satisfies ScaffoldEthConfig;

export default scaffoldConfig;
