"use client";

import { ReactNode, createContext, useContext } from "react";
import { CampaignDetailProps } from "./CampaignDetails.types";
import { useCampaignDetailsController } from "./CampaignDetails.controller";
import dayjs from "dayjs";
import { truncateAddress } from "../../services/utils";

const CampaignDetailsContext = createContext<
  ReturnType<typeof useCampaignDetailsController> | undefined
>(undefined);

const Indicator = ({ children }: { children: ReactNode }) => (
  <div className="text-xs text-neutral-400">{children}</div>
);

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
    primaryWallet,
  } = useContext(CampaignDetailsContext)!;

  if (isPageLoading)
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center">
        <div className="loading loading-bars loading-lg mb-5"></div>
        <div className="text-2xl">Loading Page...</div>
      </div>
    );

  if (isDepositLoading) return <>depositing funds...</>;

  return (
    <div className="flex justify-center items-center">
      <div className="w-3/5 p-5 flex flex-col items-start justify-start rounded-md bg-base-300 mt-10">
        <h1 className="text-2xl font-bold">{campaignDetailData.data.name}</h1>
        <div>
          <div className="flex justify-between gap-6">
            <div>
              <Indicator>Network</Indicator>
              <div>Ethereum</div>
            </div>
            <div>
              <Indicator>Status</Indicator>
              {campaignDetailData.isActive ? (
                <div className="badge badge-success">active</div>
              ) : (
                <div className="badge badge-error">inactive</div>
              )}
            </div>
            <div>
              <Indicator>Progress</Indicator>
              <span className="text-xl">{campaignDetailData.raisedAmount}</span>
              <span className=""> / {campaignDetailData.targetAmount}</span>
              <span className="font-bold"> USDT</span>
            </div>
            <div>
              <Indicator>Ends At</Indicator>
              <div>
                {(() => {
                  const finishDate = new Date(
                    new Date(campaignDetailData.data.startTime).getTime() +
                      (campaignDetailData.duration || 0) * 1000
                  );

                  return dayjs(finishDate).format("YYYY-MM-DD");
                })()}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Indicator>Description</Indicator>
            <div>{campaignDetailData.data.description}</div>
          </div>
        </div>

        {/* owner section */}
        {isCampaignOwner && (
          <div className="flex-1 mt-5">
            <h2 className="font-bold">Owner Withdraw</h2>
            <p className="text-sm text-neutral-400">
              You are the owner of this campaign, you can withdraw funds here,
              please be careful of this operation. The campaign will finish once
              you withdraw. It might take some time for the funs to arrive in
              your wallet.
            </p>
            <button className="btn btn-error" onClick={handleOwnerWithdraw}>
              Withdraw Raised Amount
            </button>
          </div>
        )}

        {/* public section */}
        <div className="mt-5 flex w-full">
          <div className="flex-1">
            <h2 className="font-bold">Deposit</h2>
            <p className="text-sm text-neutral-400">
              This deposit will be taken from your primary wallet.
            </p>

            <div className="flex gap-3">
              <div className="flex items-center justify-between input">
                <input
                  type="number"
                  className="input"
                  placeholder="deposit USDT"
                  value={depositInput}
                  onChange={(e) => setDepositInput(parseInt(e.target.value))}
                />
                <div className="font-bold">USDT</div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleDepositFunds({})}
              >
                Deposit
              </button>
            </div>

            {primaryWallet && (
              <div className="text-sm mt-2 text-primary">
                <span className="font-bold">Connected Primary Wallet</span>{" "}
                {truncateAddress(primaryWallet.address, 3)} (
                {primaryWallet.chain})
              </div>
            )}
          </div>

          {/* TODO: add functionality */}
          <div className="flex-1">
            <h2 className="font-bold">Withdraw</h2>
            <p className="text-sm text-neutral-400">
              This withdrawal will be saved to the wallet you donated from.
            </p>
            <div className="flex gap-3">
              <div className="flex items-center justify-between input">
                <input
                  type="number"
                  className="input"
                  placeholder="1000"
                  // value={depositInput}
                  // onChange={(e) => setDepositInput(parseInt(e.target.value))}
                />
                <div className="font-bold">USDT</div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleDepositFunds({})}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
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
