//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";
import {MockStarknetMessaging} from "../contracts/messaging/MockStarknetMessaging.sol";
import {IStarknetMessaging} from "@starknet/IStarknetMessaging.sol";

contract ScaffoldETHDeploy is Script {
    error InvalidChain();

    struct Deployment {
        string name;
        address addr;
    }

    string root;
    string path;
    Deployment[] public deployments;

    function setupLocalhostEnv()
        internal
        returns (uint256 localhostPrivateKey)
    {
        if (block.chainid == 31337) {
            root = vm.projectRoot();
            path = string.concat(root, "/localhost.json");
            string memory json = vm.readFile(path);
            bytes memory mnemonicBytes = vm.parseJson(json, ".wallet.mnemonic");
            string memory mnemonic = abi.decode(mnemonicBytes, (string));
            return vm.deriveKey(mnemonic, 0);
        } else {
            return vm.envUint("DEPLOYER_PRIVATE_KEY");
        }
    }

    function exportDeployments() internal {
        // fetch already existing contracts
        root = vm.projectRoot();
        path = string.concat(root, "/deployments/");
        string memory chainIdStr = vm.toString(block.chainid);
        path = string.concat(path, string.concat(chainIdStr, ".json"));

        string memory jsonWrite;

        uint256 len = deployments.length;

        for (uint256 i = 0; i < len; i++) {
            vm.serializeString(
                jsonWrite,
                vm.toString(deployments[i].addr),
                deployments[i].name
            );
        }

        string memory chainName;

        try this.getChain() returns (Chain memory chain) {
            chainName = chain.name;
        } catch {
            chainName = findChainName();
        }
        jsonWrite = vm.serializeString(jsonWrite, "networkName", chainName);
        vm.writeJson(jsonWrite, path);
    }

    function getChain() public returns (Chain memory) {
        return getChain(block.chainid);
    }

    function findChainName() public returns (string memory) {
        uint256 thisChainId = block.chainid;
        string[2][] memory allRpcUrls = vm.rpcUrls();
        for (uint256 i = 0; i < allRpcUrls.length; i++) {
            try vm.createSelectFork(allRpcUrls[i][1]) {
                if (block.chainid == thisChainId) {
                    return allRpcUrls[i][0];
                }
            } catch {
                continue;
            }
        }
        revert InvalidChain();
    }

    function _starknetMessaging() internal returns (IStarknetMessaging) {
        address starknetMessaging;
        if (block.chainid == 31337) {
            starknetMessaging = address(new MockStarknetMessaging());
            _loadMessagingContractOnL2(starknetMessaging);
        } else {
            starknetMessaging = address(new MockStarknetMessaging()); // TODO replace with StarknetMessaging on ethereum and sepolia
        }

        console.logString(
            string.concat(
                "Starknet messaging is deployed at: ",
                vm.toString(starknetMessaging)
            )
        );
        return IStarknetMessaging(starknetMessaging);
    }

    function _loadMessagingContractOnL2(address messagingContract) internal {
        string memory requestPayload = string.concat(
            '{"network_url": "http://localhost:8545", "address": "',
            vm.toString(messagingContract),
            '"}'
        );
        console.logString(requestPayload);

        string[] memory inputs = new string[](8);
        inputs[0] = "curl";
        inputs[1] = "-X";
        inputs[2] = "POST";
        inputs[3] = "http://0.0.0.0:5050/postman/load_l1_messaging_contract";
        inputs[4] = "-H";
        inputs[5] = "Content-Type: application/json";
        inputs[6] = "-d";
        inputs[7] = requestPayload;

        // Execute the FFI call
        bytes memory res = vm.ffi(inputs);
    }
}
