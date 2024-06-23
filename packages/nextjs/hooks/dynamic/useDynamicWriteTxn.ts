import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getChain } from "@dynamic-labs/utils";
import { T } from "@starknet-react/core/dist/index-79NvzQC9";
import { useMutation } from "@tanstack/react-query";
import { uint256 } from "starknet";
import { AllowArray, WalletAccount, Call } from "starknet-dev";
import {
  Address,
  Hex,
  SendTransactionParameters,
  Transaction,
  WalletClient,
  parseEther,
} from "viem";
import { tryParsingParamReturnValues } from "~~/utils/scaffold-stark/contract";

export type TransactionResult = {
  hash: string;
};

// helper functions for snet
async function sendStarknetTxn({
  provider,
  txnDetails,
}: {
  provider: WalletAccount;
  txnDetails: AllowArray<Call>;
}): Promise<TransactionResult> {
  const transaction = await provider.execute(txnDetails);

  console.log("transaction", transaction);

  console.log("receipt", transaction.transaction_hash);

  return {
    hash: transaction.transaction_hash,
  };
}

// helper functions for eth
async function sendEthTxn({
  provider,
  txnDetails,
}: {
  provider: WalletClient;
  txnDetails: Partial<SendTransactionParameters>;
}): Promise<TransactionResult> {
  const hash = await provider.sendTransaction({
    account: provider.account?.address as Address,
    chain: getChain(await provider.getChainId()),
    ...txnDetails,
  } as SendTransactionParameters);

  return { hash };
}

// helper to write txn with wallert
export default function useDynamicWriteTxn() {
  const { primaryWallet } = useDynamicContext();

  const { mutateAsync: writeTxn, ...rest } = useMutation({
    mutationFn: async (
      txnDetails: AllowArray<Call> | Partial<SendTransactionParameters>
    ): Promise<TransactionResult> => {
      if (!primaryWallet) throw new Error("Wallet not connected");
      const provider: WalletAccount | WalletClient =
        await primaryWallet?.connector.getSigner<
          WalletAccount | WalletClient
        >();

      if (!provider) throw new Error("Wallet not connected");

      if (Boolean((provider as WalletAccount).cairoVersion)) {
        return sendStarknetTxn({
          provider: provider as WalletAccount,
          txnDetails: txnDetails as AllowArray<Call>,
        });
      }

      return sendEthTxn({
        provider: provider as WalletClient,
        txnDetails: txnDetails as Partial<SendTransactionParameters>,
      });
    },
  });

  return { writeTxn, ...rest };
}
