"use client";

import { CampaignDetails } from "~~/modules/crowdfund-app/views/CampaignDetails";

export default function CampaignDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <CampaignDetails id={params.id} />;
}
