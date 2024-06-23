import { useEffect, useMemo, useState } from "react";
import { useScaffoldReadContract as useScaffoldReadETHContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { HomeTableItem } from "./Home.types";
import { useIPFS } from "../../services/ipfs";
import { ContractType } from "~~/types/aggregations";

export const useHomeController = () => {
  const ipfsClient = useIPFS();
  const { data: ethCampaignsDataRaw, ...ethCampaignsDataState } =
    useScaffoldReadETHContract({
      contractName: "CrossChainCrowdfundL1",
      functionName: "getAllCampaignsData",
    });
  const [metadatas, setMetadatas] = useState<any[]>([]);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);

  // effect to fetch multiple metadatas from IPFS
  useEffect(() => {
    if (!ethCampaignsDataRaw || !ipfsClient) return;
    setIsMetadataLoading(true);
    Promise.all(
      ethCampaignsDataRaw.map((item) =>
        ipfsClient.get(item.dataCid).then((metadata) => metadata)
      )
    )
      .then((metadataArray) => setMetadatas(metadataArray))
      .finally(() => setIsMetadataLoading(true));
  }, [ethCampaignsDataRaw, ipfsClient]);

  // parse eth campaign data
  const ethCampaignsData = useMemo(() => {
    if (isMetadataLoading || metadatas.length === 0) return [];
    if (!ethCampaignsDataRaw) return [];

    return ethCampaignsDataRaw?.map((item, index) => {
      return {
        name: metadatas[index].name,
        network: ContractType.ETH,
        targetAmount: Number(item.targetAmount),
        endsAt: (() => {
          const finishDate = new Date(
            new Date(metadatas[index].startTime).getTime() +
              (Number(item.duration) || 0) * 1000
          );

          return finishDate;
        })(),
        owner: item.owner,
        isActive: item.isActive,
      } as HomeTableItem;
    });
  }, [ethCampaignsDataRaw, isMetadataLoading, metadatas]);

  const isPageLoading = ethCampaignsDataState.isLoading || isMetadataLoading;

  return {
    ethCampaignsData,
    isPageLoading,
  };
};
