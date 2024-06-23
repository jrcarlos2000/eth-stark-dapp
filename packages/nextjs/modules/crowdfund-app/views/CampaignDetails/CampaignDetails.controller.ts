import {
  useDeployedContractInfo as useDeployedEthContractInfo,
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
import { Address, encodeFunctionData, fromHex, parseEther } from "viem";
import useDynamicWriteTxn from "~~/hooks/dynamic/useDynamicWriteTxn";
import { encodeCalldataArgs } from "../../services/starknet";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useDynamicAllAccounts } from "~~/hooks/dynamic";

export function useCampaignDetailsController(props: CampaignDetailProps) {
  const ipfsClient = useIPFS();
  const { writeTxn } = useDynamicWriteTxn();

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
  const { primaryWallet } = useDynamicContext();
  const { connectedEthAddress, connectedStarkAddress } =
    useDynamicAllAccounts();

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
      isActive,
    ] = campaignDetailDataEthRaw;

    return {
      targetAmount: Number(targetAmount),
      raisedAmount:
        Number(raisedAmountEth) + Number(raisedAmountStark || 0) / 10 ** 18,
      duration: Number(duration),
      startTime: Number(startTime),
      dataCid,
      address,
      isActive,
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

  const [isDepositLoading, setIsDepositLoading] = useState(false);

  const { data: starkMockUsdtInfo, ...starkMockUsdtInfoState } =
    useDeployedStarkContractInfo("MockUsdt");

  // deposit funds
  const handleDepositFunds = async ({
    to = ContractType.ETH,
  }: {
    to?: ContractType;
  }) => {
    setIsDepositLoading(true);

    // console.log("deposit", {
    //   depositInput,
    // });

    return writeTxn([
      {
        contractAddress: starkMockUsdtInfo!.address,
        entrypoint: "approve",
        calldata: encodeCalldataArgs([
          crowdfundStarkContractInfo.data!.address,
          BigInt((depositInput || 0) * 10 ** 18),
        ]),
      },
      {
        contractAddress: crowdfundStarkContractInfo.data!.address,
        entrypoint: "deposit_to_eth_campaign",
        calldata: encodeCalldataArgs([
          parseInt(props.id),
          BigInt((depositInput || 0) * 10 ** 18),
        ]),
      },
    ])
      .then(() => {
        refetchEthData();
        refetchStarkData();
      })
      .catch((e: any) => {
        console.error("ERRORSTACK", e.message);
        console.error("ERRORSTACK", e.stack);
      })
      .finally(() => setIsDepositLoading(false));
  };

  // withdraw
  const { writeContractAsync: writeToCrowdfundEth } =
    useScaffoldWriteEthContract("CrossChainCrowdfundL1");
  const { data: l1CrowdfundContractInfo, ...l1CrowdfundContractInfoState } =
    useDeployedEthContractInfo("CrossChainCrowdfundL1");
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState(false);

  // NOTE: currently will withdraw to connected starknet wallet, can improve by adding modal
  const handleOwnerWithdraw = () => {
    if (!isCampaignOwner) return;

    setIsLoadingWithdraw(true);

    return writeTxn({
      to: l1CrowdfundContractInfo!.address,
      value: parseEther("0.00001"),
      data: encodeFunctionData({
        abi: l1CrowdfundContractInfo!.abi,
        functionName: "campaignOwnerWithdraw",
        args: [
          BigInt(parseInt(props.id)),
          fromHex(connectedStarkAddress! as unknown as Address, "bigint"),
        ],
      }),
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
    starkMockUsdtInfoState.isLoading ||
    l1CrowdfundContractInfoState.isLoading ||
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
    primaryWallet,
  };
}
