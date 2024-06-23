"use client";

import { ReactNode, createContext, useContext } from "react";
import { CreateCampaignProps } from "./CreateCampaign.types";
import { useCreateCampaignController } from "./CreateCampaign.controller";

const CreateCampaignContext = createContext<
  ReturnType<typeof useCreateCampaignController> | undefined
>(undefined);

function FormSection({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

function FormLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm ">
      {children}
    </label>
  );
}

// implement UI here
function CreateCampaignView(props: CreateCampaignProps) {
  const {
    isCreateCampaignLoading,
    handleCreateCampaign,
    campaignData,
    updateCampaignData,
    isPageLoading,
  } = useContext(CreateCampaignContext)!;

  if (isPageLoading)
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="loading loading-bars loading-lg"></div>
        <div>Loading Page...</div>
      </div>
    );

  return (
    <div className="flex justify-center items-center">
      <div className="w-3/5 p-5 flex flex-col items-center justify-center justify-self-center rounded-md bg-base-300 mt-10">
        <h1 className="text-2xl font-bold pb-4">Create Campaign</h1>
        <div className="flex flex-col gap-4 w-full">
          <FormSection>
            <FormLabel htmlFor="name">Title</FormLabel>
            <input
              type="text"
              name="name"
              value={campaignData.name}
              placeholder="My Cool Project"
              className="input"
              onChange={(e) => updateCampaignData({ name: e.target.value })}
            />
          </FormSection>

          <FormSection>
            <FormLabel htmlFor="description">Description</FormLabel>
            <textarea
              name="description"
              className="textarea"
              value={campaignData.description}
              placeholder="Funding this project!"
              onChange={(e) =>
                updateCampaignData({ description: e.target.value })
              }
            />
          </FormSection>

          {/* TODO: networks */}

          <FormSection>
            <FormLabel htmlFor="targetAmount">Target Amount</FormLabel>
            <div className="flex items-center justify-between input">
              <input
                type="number"
                name="targetAmount"
                value={campaignData.targetAmountInUSDT}
                placeholder="1000"
                className="flex-1"
                onChange={(e) =>
                  updateCampaignData({
                    targetAmountInUSDT: parseInt(e.target.value),
                  })
                }
              />
              <div className="font-bold">USDT</div>
            </div>
          </FormSection>

          <FormSection>
            <FormLabel htmlFor="duration">Deadline</FormLabel>
            <div className="flex items-center justify-between input">
              <input
                type="number"
                name="duration"
                value={campaignData.durationInSeconds}
                placeholder="10"
                className="flex-1"
                onChange={(e) =>
                  updateCampaignData({
                    durationInSeconds: parseInt(e.target.value),
                  })
                }
              />
              <div className="font-bold">Days</div>
            </div>
          </FormSection>

          <button
            className={`btn btn-primary btn-lg w-full mt-3 ${isCreateCampaignLoading && "btn-disabled"}`}
            onClick={(e) => {
              e.preventDefault();
              if (isCreateCampaignLoading) return;

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
            Start Raising
            {isCreateCampaignLoading && (
              <span className="loading loading-spinner"></span>
            )}
          </button>
        </div>
      </div>
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
