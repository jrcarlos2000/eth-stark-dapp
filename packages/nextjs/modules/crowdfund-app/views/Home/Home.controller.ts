import { useEffect, useMemo, useState } from "react";
import { useScaffoldReadContract as useScaffoldReadETHContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { HomeTableItem } from "./Home.types";
import { useIPFS } from "../../services/ipfs";
import { ContractType } from "~~/types/aggregations";

export const useHomeController = () => {
  // const ipfsClient = useIPFS();
  const { data: ethCampaignsDataRaw, ...ethCampaignsDataState } =
    useScaffoldReadETHContract({
      contractName: "CrossChainCrowdfundL1",
      functionName: "getAllCampaignsData",
    });
  // const [metadatas, setMetadatas] = useState<any[]>([]);
  // const [isMetadataLoading, setIsMetadataLoading] = useState(false);

  // effect to fetch multiple metadatas from IPFS
  // useEffect(() => {
  //   if (!ethCampaignsDataRaw || !ipfsClient) return;
  //   setIsMetadataLoading(true);
  //   const metadataPromises = ethCampaignsDataRaw.map((item) =>
  //     ipfsClient.get(item.dataCid).then((metadata) => metadata)
  //   );
  //   Promise.all(metadataPromises)
  //     .then((metadataArray) => setMetadatas(metadataArray))
  //     .finally(() => setIsMetadataLoading(false));
  // }, [ethCampaignsDataRaw, ipfsClient]);

  // parse eth campaign data
  const ethCampaignsData = useMemo(() => {
    // if (isMetadataLoading || metadatas.length === 0) return [];
    if (!ethCampaignsDataRaw) return [];

    return ethCampaignsDataRaw?.map((item, index) => {
      return {
        name: `Campaign ${index + 1}`,
        network: ContractType.ETH,
        targetAmount: Number(item.targetAmount),
        duration: Math.trunc(Number(item.duration) / 86400),
        owner: item.owner,
        isActive: item.isActive,
        id: index + 1,
      } as HomeTableItem;
    });
  }, [ethCampaignsDataRaw]);

  const isPageLoading = ethCampaignsDataState.isLoading;

  return {
    ethCampaignsData,
    isPageLoading,
  };
};
