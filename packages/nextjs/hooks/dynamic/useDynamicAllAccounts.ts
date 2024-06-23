import {
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";

export const useDynamicAllAccounts = () => {
  const wallets = useUserWallets();

  return {
    connectedEthAddress: (() => {
      const walletInstance = wallets.filter(
        (wallet) => wallet.chain === "EVM"
      )[0] || { address: "" };
      return walletInstance.address;
    })(),
    connectedStarkAddress: (() => {
      const walletInstance = wallets.filter(
        (wallet) => wallet.chain === "STARK"
      )[0] || { address: "" };
      return walletInstance.address ?? "";
    })(),
  };
};
