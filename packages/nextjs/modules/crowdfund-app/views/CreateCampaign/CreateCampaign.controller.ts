import { useWriteContract } from "wagmi";
import { CampaignData, CreateCampaignProps } from "./CreateCampaign.types";
import {
  useDeployedContractInfo,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { useState } from "react";
import { useIPFS } from "../../services/ipfs";

// implement controller here
export function useCreateCampaignController(props: CreateCampaignProps) {
  const { writeContractAsync: writeContractEth } = useScaffoldWriteContract(
    "CrossChainCrowdfundL1"
  );
  const [isCreateCampaignLoading, setIsCreateCampaignLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: "",
    durationInSeconds: 0,
    targetAmountInUSDT: 0,
  });
  const ipfsClient = useIPFS();

  // create campaign
  const handleCreateCampaign = async ({
    targetAmount,
    duration,
    data,
  }: {
    targetAmount: number;
    duration: number;
    data: any;
  }) => {
    setIsCreateCampaignLoading(true);

    // create ipfs CID
    const dataCid = await ipfsClient.add(JSON.stringify(data));

    return writeContractEth({
      functionName: "createCampaign",
      args: [BigInt(targetAmount), BigInt(duration), dataCid.toString()],
    }).then(() => setIsCreateCampaignLoading(false));
  };

  // state updater
  const updateCampaignData = (newData: Partial<CampaignData>) =>
    setCampaignData((prev) => ({ ...prev, ...newData }));

  return {
    isCreateCampaignLoading,
    handleCreateCampaign,
    campaignData,
    updateCampaignData,
  };
}
