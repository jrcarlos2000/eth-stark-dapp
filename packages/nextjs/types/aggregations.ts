import { ContractName as EthContractName } from "~~/utils/scaffold-eth/contract";
import { ContractName as StarkContractName } from "~~/utils/scaffold-stark/contract";

export enum ContractType {
  Starknet = "starknet",
  ETH = "eth",
}

export type ContractName = StarkContractName | EthContractName;
