import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex justify-end w-screen ">
      <div className="flex items-center gap-3 px-4 my-2">
        <Link href={"/crowdfund-app/create"} className="btn btn-primary">
          Create Campaign
        </Link>
        <DynamicWidget />
      </div>
    </div>
  );
}
