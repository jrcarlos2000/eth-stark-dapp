import type { Metadata } from "next";
import { IPFSProvider } from "~~/modules/crowdfund-app/services/ipfs";

export const metadata: Metadata = {
  title: "Crowdfund",
  description: "Get your stuff going",
  icons: "/logo.ico",
};

const CrowdfundAppLayout = ({ children }: { children: React.ReactNode }) => {
  return <IPFSProvider>{children}</IPFSProvider>;
};

export default CrowdfundAppLayout;
