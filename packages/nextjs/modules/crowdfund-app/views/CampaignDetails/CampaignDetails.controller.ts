import { useScaffoldReadContract as useScaffoldReadEthContract } from "~~/hooks/scaffold-eth";
import { CampaignDetailProps } from "./CampaignDetails.types";
import { useMemo, useState } from "react";
import { useAccount as useEthAccount } from "wagmi";
import { useAccount as useStarkAccount } from "@starknet-react/core";
import { ContractType } from "~~/types/aggregations";
import { useScaffoldWriteContract as useScaffoldWriteStarkContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useDeployedContractInfo as useDeployedStarkContractInfo } from "~~/hooks/scaffold-stark";
import { useScaffoldReadContract as useScaffoldReadStarkContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useIPFS } from "../../services/ipfs";
import { useQuery } from "@tanstack/react-query";

export function useCampaignDetailsController(props: CampaignDetailProps) {
  const ipfsClient = useIPFS();

  // fetch the contract details from ethereum
  // TODO: fetch contracts from starknet
  const { data: campaignDetailDataRaw, isLoading: campaignDetailIsLoading } =
    useScaffoldReadEthContract({
      contractName: "CrossChainCrowdfundL1",
      functionName: "campaigns",
      args: [BigInt(parseInt(props.id))],
    });

  // get connected address
  const { address: connectedEthAddress } = useEthAccount();
  const { address: connectedStarkAddress } = useStarkAccount();

  const [depositInput, setDepositInput] = useState<number>(0);

  // post process raw data
  const campaignDetailData = useMemo(() => {
    if (!campaignDetailDataRaw) return undefined;

    const [targetAmount, raisedAmount, duration, startTime, dataCid, address] =
      campaignDetailDataRaw;

    return {
      targetAmount: Number(targetAmount),
      raisedAmount: Number(raisedAmount),
      duration: Number(duration),
      startTime: Number(startTime),
      dataCid,
      address,
    };
  }, [campaignDetailDataRaw]);

  // metadata
  const metadataQuery = useQuery({
    queryKey: ["metadata", props.id],
    queryFn: async () => {
      return ipfsClient.get(campaignDetailData?.dataCid!);
    },
  });

  // to check if this page is visited by owner, used to toggle withdraw button
  const isCampaignOwner = Boolean(
    campaignDetailData?.address === connectedEthAddress
  );

  // deposit to eth contract from stark
  const crowdfundStarkContractInfo = useDeployedStarkContractInfo(
    "CrossChainCrowdfundL2"
  );
  const { data: allowanceData, isLoading: isAllowanceLoading } =
    useScaffoldReadStarkContract({
      contractName: "MockUsdt",
      functionName: "allowance",
      args: [
        connectedStarkAddress as string,
        crowdfundStarkContractInfo.data?.address as string,
      ],
    });
  const { writeAsync: writeUSDTApprovalForStark } =
    useScaffoldWriteStarkContract({
      contractName: "MockUsdt",
      functionName: "approve",
      args: [crowdfundStarkContractInfo.data?.address, 0],
    });
  const { writeAsync: writeDepositToContract } = useScaffoldWriteStarkContract({
    contractName: "CrossChainCrowdfundL2",
    functionName: "deposit_to_eth_campaign",
    args: [BigInt(parseInt(props.id)), depositInput],
  });
  const [isDepositLoading, setIsDepositLoading] = useState(false);

  // deposit funds
  const handleDepositFunds = async ({
    to = ContractType.ETH,
  }: {
    to?: ContractType;
  }) => {
    setIsDepositLoading(true);
    try {
      if (allowanceData ?? 0 < depositInput)
        await writeUSDTApprovalForStark({
          args: [crowdfundStarkContractInfo.data?.address, depositInput],
        });

      return writeDepositToContract();
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setIsDepositLoading(false);
    }
  };

  // withdraw
  const handleOwnerWithdraw = () => {
    if (!isCampaignOwner) return;
  };

  const isPageLoading =
    campaignDetailIsLoading ||
    metadataQuery.isLoading ||
    isAllowanceLoading ||
    crowdfundStarkContractInfo.isLoading;

  return {
    campaignDetailData: { ...campaignDetailData, data: metadataQuery.data },
    campaignDetailIsLoading,
    isCampaignOwner,
    handleDepositFunds,
    isDepositLoading,
    depositInput,
    setDepositInput,
    isPageLoading,
  };
}
