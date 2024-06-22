import { ReactNode, createContext, useContext } from "react";
import { CreateCampaignProps } from "./CreateCampaign.types";
import { useCreateCampaignController } from "./CreateCampaign.controller";

const CreateCampaignContext = createContext<any | undefined>(undefined);

// implement UI here
function CreateCampaignView(props: CreateCampaignProps) {
  const controller = useContext(CreateCampaignContext);

  return <>create campaign</>;
}

export function CreateCampaign(props: CreateCampaignProps) {
  const controller = useCreateCampaignController(props);

  return (
    <CreateCampaignContext.Provider value={controller}>
      <CreateCampaignView {...props} />
    </CreateCampaignContext.Provider>
  );
}
