import { ContractType } from "~~/types/aggregations";

export type HomeTableItem = {
  name: string;
  network: ContractType;
  targetAmount: number;
  endsAt: Date;
  owner: string;
  isActive: boolean;
};
