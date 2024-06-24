import { CampaignData, CreateCampaignProps } from "./CreateCampaign.types";
import {
  useDeployedContractInfo,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { useState } from "react";
import { useIPFS } from "../../services/ipfs";
import { useRouter } from "next/navigation";
import { useAccount as useEthAccount } from "wagmi";
import { encodeAbiParameters, encodeFunctionData, fromHex } from "viem";
import useDynamicWriteTxn from "~~/hooks/dynamic/useDynamicWriteTxn";
import { ContractType } from "~~/types/aggregations";

// implement controller here
export function useCreateCampaignController(props: CreateCampaignProps) {
  const router = useRouter();
  const { writeContractAsync: writeContractEth } = useScaffoldWriteContract(
    "CrossChainCrowdfundL1"
  );
  const { data: l1ContractInfo, ...l1ContractInfoStates } =
    useDeployedContractInfo("CrossChainCrowdfundL1");
  const [isCreateCampaignLoading, setIsCreateCampaignLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: "",
    description: "",
    durationInSeconds: 0,
    targetAmountInUSDT: 0,
    network: ContractType.ETH,
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

  // dynamic integration
  const { writeTxn } = useDynamicWriteTxn();

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

    return writeTxn({
      to: l1ContractInfo?.address,
      data: encodeFunctionData({
        abi: l1ContractInfo!.abi,
        functionName: "createCampaign",
        args: [BigInt(targetAmount), BigInt(duration), dataCid.toString()],
      }),
    }).catch(() => setIsCreateCampaignLoading(false));
  };

  // state updater
  const updateCampaignData = (newData: Partial<CampaignData>) =>
    setCampaignData((prev) => ({ ...prev, ...newData }));

  const isPageLoading = l1ContractInfoStates.isLoading;

  return {
    isCreateCampaignLoading,
    handleCreateCampaign,
    campaignData,
    updateCampaignData,
    isPageLoading,
  };
}
