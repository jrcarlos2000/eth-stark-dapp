"use client";

import { createContext, useContext } from "react";
import { useCampaignDetailsController } from "./CampaignDetails.controller";
import { CampaignDetailProps } from "./CampaignDetails.types";

const CampaignDetailsContext = createContext<
  ReturnType<typeof useCampaignDetailsController> | undefined
>(undefined);

// implement UI here
function CampaignDetailsView(props: CampaignDetailProps) {
  return <>campaign details: {props.id}</>;
}

export function CampaignDetails(props: CampaignDetailProps) {
  const controller = useCampaignDetailsController(props);

  return (
    <CampaignDetailsContext.Provider value={controller}>
      <CampaignDetailsView {...props} />
    </CampaignDetailsContext.Provider>
  );
}
