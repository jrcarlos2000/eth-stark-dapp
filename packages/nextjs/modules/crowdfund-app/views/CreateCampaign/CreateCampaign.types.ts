import { ContractType } from "~~/types/aggregations";

export type CreateCampaignProps = {};

export type CampaignData = {
  name: string;
  targetAmountInUSDT: number;
  durationInSeconds: number;
  description: string;
  network: ContractType;
};
