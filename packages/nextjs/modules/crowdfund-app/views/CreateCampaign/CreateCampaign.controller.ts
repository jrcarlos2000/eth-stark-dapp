import { useWriteContract } from "wagmi";
import { CreateCampaignProps } from "./CreateCampaign.types";

// implement controller here
export function useCreateCampaignController(props: CreateCampaignProps) {
  const { writeContract: writeContractEth } = useWriteContract();

  return {};
}
