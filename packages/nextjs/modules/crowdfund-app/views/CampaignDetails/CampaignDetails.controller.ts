import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { CampaignDetailProps } from "./CampaignDetails.types";
import { useMemo } from "react";

export function useCampaignDetailsController(props: CampaignDetailProps) {
  const { data: campaignDetailDataRaw, isLoading: campaignDetailIsLoading } =
    useScaffoldReadContract({
      contractName: "CrossChainCrowdfundL1",
      functionName: "campaigns",
      args: [BigInt(parseInt(props.id))],
    });

  // post process
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

  return {
    campaignDetailData,
    campaignDetailIsLoading,
  };
}
