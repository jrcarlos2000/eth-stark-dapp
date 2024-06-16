//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {L1MessageContract} from "../contracts/L1MessageContract.sol";
import "./DeployHelpers.s.sol";
import {IStarknetMessaging} from "@starknet/IStarknetMessaging.sol";

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
        L1MessageContract l1MessageContract = new L1MessageContract(
            address(starknetMessaging)
        );
        console.logString(
            string.concat(
                "L1MessageContract deployed at: ",
                vm.toString(address(l1MessageContract))
            )
        );
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
