import { useHomeController } from "./Home.controller";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { truncateAddress } from "~~/modules/crowdfund-app/services/utils";

export default function Home() {
  const { ethCampaignsData, isPageLoading } = useHomeController();
  const router = useRouter();

  if (isPageLoading)
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center">
        <div className="loading loading-bars loading-lg mb-5"></div>
        <div className="text-2xl">Loading Page...</div>
      </div>
    );

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="overflow-x-auto w-3/5 border border-slate-600 rounded-md">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              {/* <th>Name</th> */}
              <th>Owner</th>
              <th>Network</th>
              <th>Target</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ethCampaignsData.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer hover:bg-neutral-200"
                onClick={() => router.push(`/crowdfund-app/detail/${item.id}`)}
              >
                {/* <td>{item.name}</td> */}
                <td>{truncateAddress(item.owner, 4)}</td>
                <td>{item.network}</td>
                <td>{item.targetAmount} USDT</td>
                <td>{item.duration} days</td>
                <td>
                  {item.isActive ? (
                    <div className="badge badge-success gap-2">active</div>
                  ) : (
                    <div className="badge badge-error gap-2">inactive</div>
                  )}
                </td>
              </tr>
            ))}
            {/* row 1 */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
