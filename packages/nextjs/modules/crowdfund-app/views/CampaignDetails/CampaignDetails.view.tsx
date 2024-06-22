"use client";

import { createContext, useContext } from "react";
import { CampaignDetailProps } from "./CampaignDetails.types";
import { useCampaignDetailsController } from "./CampaignDetails.controller";

const CampaignDetailsContext = createContext<
  ReturnType<typeof useCampaignDetailsController> | undefined
>(undefined);

// implement UI here
function CampaignDetailsView(props: CampaignDetailProps) {
  const { campaignDetailIsLoading, campaignDetailData } = useContext(
    CampaignDetailsContext
  )!;

  if (campaignDetailIsLoading) return <>loading...</>;

  return (
    <div>
      <h1>Campaign detail</h1>
      <div>{JSON.stringify(campaignDetailData, null, "\t")}</div>
    </div>
  );
}

export function CampaignDetails(props: CampaignDetailProps) {
  const controller = useCampaignDetailsController(props);

  return (
    <CampaignDetailsContext.Provider value={controller}>
      <CampaignDetailsView {...props} />
    </CampaignDetailsContext.Provider>
  );
}
