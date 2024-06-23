import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex justify-between items-center px-4 py-2">
      <Link href={"/crowdfund-app"} className="font-bold">
        CrossFund
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href={"/crowdfund-app/create"}
          className="btn btn-primary btn-sm h-full"
        >
          Create Campaign
        </Link>
        <DynamicWidget />
      </div>
    </div>
  );
}
