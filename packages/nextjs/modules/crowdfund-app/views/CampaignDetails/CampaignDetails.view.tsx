"use client";

import { createContext, useContext } from "react";
import { CampaignDetailProps } from "./CampaignDetails.types";
import { useCampaignDetailsController } from "./CampaignDetails.controller";

const CampaignDetailsContext = createContext<
  ReturnType<typeof useCampaignDetailsController> | undefined
>(undefined);

// implement UI here
function CampaignDetailsView(props: CampaignDetailProps) {
  const {
    isPageLoading,
    campaignDetailData,
    handleDepositFunds,
    setDepositInput,
    depositInput,
    isDepositLoading,
    isCampaignOwner,
    handleOwnerWithdraw,
  } = useContext(CampaignDetailsContext)!;

  if (isPageLoading || isDepositLoading) return <>loading...</>;

  return (
    <div>
      <h1>Campaign detail</h1>
      <div>{JSON.stringify(campaignDetailData, null, "\t")}</div>
      <input
        type="number"
        placeholder="deposit USDT"
        value={depositInput}
        onChange={(e) => setDepositInput(parseInt(e.target.value))}
      />
      <button className="btn" onClick={() => handleDepositFunds({})}>
        deposit from stark to eth
      </button>
      {isCampaignOwner && (
        <button className="btn" onClick={handleOwnerWithdraw}>
          withdraw raised amount
        </button>
      )}
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
