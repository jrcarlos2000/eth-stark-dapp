import { CampaignData, CreateCampaignProps } from "./CreateCampaign.types";
import {
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { useState } from "react";
import { useIPFS } from "../../services/ipfs";
import { useRouter } from "next/navigation";
import { useAccount as useEthAccount } from "wagmi";
import { fromHex } from "viem";

// implement controller here
export function useCreateCampaignController(props: CreateCampaignProps) {
  const router = useRouter();
  const { writeContractAsync: writeContractEth } = useScaffoldWriteContract(
    "CrossChainCrowdfundL1"
  );
  const [isCreateCampaignLoading, setIsCreateCampaignLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: "",
    durationInSeconds: 0,
    targetAmountInUSDT: 0,
  });
  const { address } = useEthAccount();
  const ipfsClient = useIPFS();

  // watch for successful creations
  useScaffoldWatchContractEvent({
    contractName: "CrossChainCrowdfundL1",
    eventName: "EthCampaignCreated",
    onLogs: (logs) => {
      const { campaignId, owner } = logs[0].args;
      if (fromHex(address!, "bigint") === owner) {
        setIsCreateCampaignLoading(false);
        router.push(`/crowdfund-app/detail/${Number(campaignId)}`);
      }
    },
  });

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
    }).catch(() => setIsCreateCampaignLoading(false));
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
