//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CrossChainCrowdfundL1} from "../contracts/CrossChainCrowdfundL1.sol";
import "./DeployHelpers.s.sol";
import {IStarknetMessaging} from "@starknet/IStarknetMessaging.sol";
import {MockUSDT} from "../contracts/MockUSDT.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);
        IStarknetMessaging starknetMessaging = _starknetMessaging(); // read only once

        MockUSDT mockUSDT = new MockUSDT(vm.addr(deployerPrivateKey));
        CrossChainCrowdfundL1 l1MessageContract = new CrossChainCrowdfundL1(
            address(starknetMessaging),
            address(mockUSDT)
        );
        console.logString(
            string.concat(
                "L1MessageContract deployed at: ",
                vm.toString(address(l1MessageContract))
            )
        );
        console.logString(
            string.concat(
                "MockUSDT deployed at: ",
                vm.toString(address(mockUSDT))
            )
        );

        // SETUP L2 CONTRACT ADDRESS
        uint256 l2ContractAddress = 0x017dec6ea1142e8fba7c0adf0328981650cfaefe30bf21080d14ff52deed1363;
        l1MessageContract.setUpTargetContract(l2ContractAddress);
        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function test() public {}
}
