import { deployContract, deployer, exportDeployments } from "./deploy-contract";

const deployScript = async (): Promise<void> => {
  const { address: mockUsdtAddress } = await deployContract(
    {
      recipient: deployer.address,
    },
    "MockUsdt"
  );
  await deployContract(
    {
      owner: deployer.address,
      base_token: mockUsdtAddress,
    },
    "CrossChainCrowdfundL2"
  );
};

deployScript()
  .then(() => {
    exportDeployments();
    console.log("All Setup Done");
  })
  .catch(console.error);
