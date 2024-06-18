import scaffoldEthConfig from "~~/scaffold-eth.config";
import { contracts } from "~~/utils/scaffold-eth/contract";

export function getAllContracts() {
  const contractsData = contracts?.[scaffoldEthConfig.targetNetworks[0].id];
  return contractsData ? contractsData : {};
}
