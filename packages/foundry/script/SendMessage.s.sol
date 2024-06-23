// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

import {CrossChainCrowdfundL1} from "../contracts/CrossChainCrowdfundL1.sol";
import {MockUSDT} from "../contracts/MockUSDT.sol";

/**
 * @notice A simple script to send a message to Starknet.
 */
contract Value is Script {
    uint256 _privateKey;
    address _contractMsgAddress;
    address _starknetMessagingAddress;
    uint256 _l2ContractAddress;
    uint256 _l2Selector;

    function setUp() public {
        _privateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        _contractMsgAddress = vm.envAddress("CONTRACT_MSG_ADDRESS");
        _starknetMessagingAddress = vm.envAddress("SN_MESSAGING_ADDRESS");
        _l2ContractAddress = vm.envUint("L2_CONTRACT_ADDRESS");
    }

    function run() public {
        vm.startBroadcast(_privateKey);

        // CrossChainCrowdfundL1 l1MessageContract = CrossChainCrowdfundL1(
        //     0xF5FCa5bb18Bf721aBEf892bE02DA2145b91A7caC
        // );
        // MockUSDT mockUSDT = MockUSDT(
        //     0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
        // );

        // l1MessageContract.createCampaign(1000 * 10 ** 18, 10000, "dataCid");
        // // address recipient = 0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1
        // l1MessageContract.campaignOwnerWithdraw{value: 22152977922569}(
        //     1,
        //     0x45824d7c98e82c23c9eb9cf5af3b3fadca9332595ebbca1b530c65ca2e893b2
        // );

        // uint256[] memory payload = new uint256[](2);
        // payload[0] = 1;
        // payload[
        //     1
        // ] = 0x45824d7c98e82c23c9eb9cf5af3b3fadca9332595ebbca1b530c65ca2e893b2;

        // // test function directly to l1l2 message
        // payable(0xE2Bb56ee936fd6433DC0F6e7e3b8365C906AA057).call{
        //     value: 10 * 10 ** 14
        // }(
        //     abi.encodeWithSelector(
        //         0x3e3aa6c5,
        //         178421784751192988021491748254261707007368574029609589928834239612056586058,
        //         1332541533965341926675691187519972025746915526174496555423558258253009088846,
        //         payload
        //     )
        // );
        // vm.stopBroadcast();
    }
}

/**
 * @notice A simple script to send a message to Starknet.
 */
// contract Struct is Script {
//     uint256 _privateKey;
//     address _contractMsgAddress;
//     address _starknetMessagingAddress;
//     uint256 _l2ContractAddress;
//     uint256 _l2Selector;

//     function setUp() public {
//         _privateKey = vm.envUint("ACCOUNT_PRIVATE_KEY");
//         _contractMsgAddress = vm.envAddress("CONTRACT_MSG_ADDRESS");
//         _starknetMessagingAddress = vm.envAddress("SN_MESSAGING_ADDRESS");
//         _l2ContractAddress = vm.envUint("L2_CONTRACT_ADDRESS");
//         _l2Selector = vm.envUint("L2_SELECTOR_STRUCT");
//     }

//     function run() public {
//         vm.startBroadcast(_privateKey);

//         uint256[] memory payload = new uint256[](2);
//         payload[0] = 1;
//         payload[1] = 2;

//         // Remember that there is a cost of at least 20k wei to send a message.
//         // Let's send 30k here to ensure that we pay enough for our payload serialization.
//         L1MessageContract(payable(_contractMsgAddress)).sendMessage{
//             value: 40000
//         }(_l2ContractAddress, _l2Selector, payload);

//         vm.stopBroadcast();
//     }
// }
