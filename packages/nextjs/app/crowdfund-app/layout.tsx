import type { Metadata } from "next";
import "~~/styles/globals.css";
import Header from "~~/modules/crowdfund-app/components/Header";
import { IPFSProvider } from "~~/modules/crowdfund-app/services/ipfs";

export const metadata: Metadata = {
  title: "CrossFund - Cross Chain Seamless Crowdfunding",
  description: "Seamlessly crowdfund your projects cross-chain!",
  icons: "/logo.ico",
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <IPFSProvider>{children}</IPFSProvider>;
};

const CrowdfundAppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <Header />
      {children}
    </Providers>
  );
};

export default CrowdfundAppLayout;
