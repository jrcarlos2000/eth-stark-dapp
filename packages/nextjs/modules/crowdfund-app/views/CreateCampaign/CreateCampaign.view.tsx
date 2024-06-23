"use client";

import { createContext, useContext } from "react";
import { CreateCampaignProps } from "./CreateCampaign.types";
import { useCreateCampaignController } from "./CreateCampaign.controller";

const CreateCampaignContext = createContext<
  ReturnType<typeof useCreateCampaignController> | undefined
>(undefined);

// implement UI here
function CreateCampaignView(props: CreateCampaignProps) {
  const {
    isCreateCampaignLoading,
    handleCreateCampaign,
    campaignData,
    updateCampaignData,
    isPageLoading,
  } = useContext(CreateCampaignContext)!;

  if (isPageLoading) return <>loading page...</>;
  if (isCreateCampaignLoading) return <>loading: creating campaign...</>;

  return (
    <div>
      <h1>Create Campaign</h1>
      <input
        type="text"
        value={campaignData.name}
        placeholder="campaign name"
        onChange={(e) => updateCampaignData({ name: e.target.value })}
      />
      <input
        type="number"
        value={campaignData.targetAmountInUSDT}
        placeholder="target in usdt"
        onChange={(e) =>
          updateCampaignData({ targetAmountInUSDT: parseInt(e.target.value) })
        }
      />
      <input
        type="number"
        value={campaignData.durationInSeconds}
        placeholder="duration in seconds"
        onChange={(e) =>
          updateCampaignData({ durationInSeconds: parseInt(e.target.value) })
        }
      />
      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault();
          const {
            name,
            durationInSeconds: duration,
            targetAmountInUSDT: targetAmount,
          } = campaignData;
          handleCreateCampaign({
            targetAmount,
            duration,
            data: JSON.stringify({
              name,
            }),
          });
        }}
      >
        create campaign
      </button>
    </div>
  );
}

export function CreateCampaign(props: CreateCampaignProps) {
  const controller = useCreateCampaignController(props);

  return (
    <CreateCampaignContext.Provider value={controller}>
      <CreateCampaignView {...props} />
    </CreateCampaignContext.Provider>
  );
}
