import {
  useScaffoldReadContract as useScaffoldReadEthContract,
  useScaffoldWriteContract as useScaffoldWriteEthContract,
} from "~~/hooks/scaffold-eth";
import { CampaignDetailProps } from "./CampaignDetails.types";
import { useMemo, useState } from "react";
import { useAccount as useEthAccount } from "wagmi";
import { useAccount as useStarkAccount } from "@starknet-react/core";
import { ContractType } from "~~/types/aggregations";
import { useDeployedContractInfo as useDeployedStarkContractInfo } from "~~/hooks/scaffold-stark";
import { useScaffoldReadContract as useScaffoldReadStarkContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useIPFS } from "../../services/ipfs";
import { useQuery } from "@tanstack/react-query";
import {
  createContractCall as createStarkContractCall,
  useScaffoldMultiWriteContract as useScaffoldMultiWriteStarkContract,
} from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { Address, fromHex, parseEther, parseUnits } from "viem";

export function useCampaignDetailsController(props: CampaignDetailProps) {
  const ipfsClient = useIPFS();

  // fetch the contract details from ethereum
  // TODO: fetch contracts from starknet
  const {
    data: campaignDetailDataEthRaw,
    isLoading: campaignDetailIsLoading,
    refetch: refetchEthData,
  } = useScaffoldReadEthContract({
    contractName: "CrossChainCrowdfundL1",
    functionName: "campaigns",
    args: [BigInt(parseInt(props.id))],
  });

  const {
    data: raisedAmountStark,
    isLoading: raisedAmountStarkLoading,
    refetch: refetchStarkData,
  } = useScaffoldReadStarkContract({
    contractName: "CrossChainCrowdfundL2",
    functionName: "get_eth_campaign",
    args: [parseInt(props.id)],
  });

  // get connected address
  const { address: connectedEthAddress } = useEthAccount();
  const { address: connectedStarkAddress } = useStarkAccount();

  const [depositInput, setDepositInput] = useState<number>(0);

  // post process raw data
  const campaignDetailData = useMemo(() => {
    if (!campaignDetailDataEthRaw) return undefined;

    const [
      targetAmount,
      raisedAmountEth,
      duration,
      startTime,
      dataCid,
      address,
    ] = campaignDetailDataEthRaw;

    return {
      targetAmount: Number(targetAmount),
      raisedAmount:
        Number(raisedAmountEth) + Number(raisedAmountStark || 0) / 10 ** 18,
      duration: Number(duration),
      startTime: Number(startTime),
      dataCid,
      address,
    };
  }, [campaignDetailDataEthRaw, raisedAmountStark]);

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
  const { writeAsync: approveAndDepositToStark } =
    useScaffoldMultiWriteStarkContract({
      calls: [
        createStarkContractCall("MockUsdt", "approve", [
          crowdfundStarkContractInfo.data?.address,
          BigInt((depositInput || 0) * 10 ** 18),
        ]),
        createStarkContractCall(
          "CrossChainCrowdfundL2",
          "deposit_to_eth_campaign",
          [parseInt(props.id), BigInt((depositInput || 0) * 10 ** 18)]
        ),
      ],
    });
  const [isDepositLoading, setIsDepositLoading] = useState(false);

  // deposit funds
  const handleDepositFunds = async ({
    to = ContractType.ETH,
  }: {
    to?: ContractType;
  }) => {
    setIsDepositLoading(true);
    return approveAndDepositToStark()
      .then(() => {
        refetchEthData();
        refetchStarkData();
      })
      .finally(() => setIsDepositLoading(false));
  };

  // withdraw
  const { writeContractAsync: writeToCrowdfundEth } =
    useScaffoldWriteEthContract("CrossChainCrowdfundL1");
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState(false);

  // NOTE: currently will withdraw to connected starknet wallet, can improve by adding modal
  const handleOwnerWithdraw = () => {
    if (!isCampaignOwner) return;

    setIsLoadingWithdraw(true);
    return writeToCrowdfundEth({
      functionName: "campaignOwnerWithdraw",
      value: parseEther("0.0001"),
      args: [
        BigInt(parseInt(props.id)),
        fromHex(connectedStarkAddress! as unknown as Address, "bigint"),
      ],
    })
      .then(() => {
        refetchEthData();
        refetchStarkData();
      })
      .finally(() => setIsLoadingWithdraw(false));
  };

  const isPageLoading =
    campaignDetailIsLoading ||
    metadataQuery.isLoading ||
    crowdfundStarkContractInfo.isLoading ||
    isLoadingWithdraw ||
    raisedAmountStarkLoading;

  const isGoal = (() => {
    const totalRaisedAmount = campaignDetailData?.raisedAmount || 0;
    const totalTargetAmount = campaignDetailData?.targetAmount || 999999999999;
    return totalRaisedAmount >= totalTargetAmount;
  })();

  return {
    campaignDetailData: { ...campaignDetailData, data: metadataQuery.data },
    campaignDetailIsLoading,
    isCampaignOwner,
    handleDepositFunds,
    isDepositLoading,
    depositInput,
    setDepositInput,
    isPageLoading,
    isGoal,
    handleOwnerWithdraw,
  };
}
