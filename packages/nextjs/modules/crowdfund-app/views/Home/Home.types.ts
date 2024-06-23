import { ContractType } from "~~/types/aggregations";

export type HomeTableItem = {
  name: string;
  network: ContractType;
  targetAmount: number;
  duration: number;
  owner: string;
  isActive: boolean;
  id: number;
};
