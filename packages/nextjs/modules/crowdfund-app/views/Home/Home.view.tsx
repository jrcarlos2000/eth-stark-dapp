import { eth } from "starknet-dev";
import { useHomeController } from "./Home.controller";

export default function Home() {
  const { ethCampaignsData, isPageLoading } = useHomeController();

  if (isPageLoading)
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center">
        <div className="loading loading-bars loading-lg mb-5"></div>
        <div className="text-2xl">Loading Page...</div>
      </div>
    );

  return (
    <div>
      {JSON.stringify(
        ethCampaignsData,
        (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
      )}
    </div>
  );
}
