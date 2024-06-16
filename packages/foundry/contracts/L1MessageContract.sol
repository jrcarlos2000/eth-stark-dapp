//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@starknet/IStarknetMessaging.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract L1MessageContract is Ownable {
    IStarknetMessaging internal _starknetMessaging;

    uint256 public SINGLE_VALUE_L2_SELECTOR =
        0x399c30a1fb5cdd98f7ec69cae6ff631910f71a5f95110c2de1f259e7e575d0;

    constructor(address starknetMessaging) Ownable(msg.sender) {
        _starknetMessaging = IStarknetMessaging(starknetMessaging);
    }

    // -----------------------------------------
    // -------- L1 - L2 Messaging --------------
    // -----------------------------------------

    function sendMessage(
        uint256 l2ContractAddress,
        uint256 randomNumber
    ) external payable {
        uint256[] memory payload = new uint256[](1);
        payload[0] = randomNumber;

        _starknetMessaging.sendMessageToL2{value: msg.value}(
            l2ContractAddress,
            SINGLE_VALUE_L2_SELECTOR,
            payload
        );
    }

    // function sendMessage(
    //     uint256 l2ContractAddress,
    //     uint256 randomNumber1,
    //     uint256 randomNumber2
    // ) external payable {
    //     _starknetMessaging.sendMessageToL2{value: msg.value}(
    //         l2ContractAddress,
    //         SINGLE_VALUE_L2_SELECTOR,
    //         payload
    //     );
    // }

    /**
       @notice A simple function that sends a message with a pre-determined payload.
    */
    // function sendMessageValue(
    //     uint256 contractAddress,
    //     uint256 selector,
    //     uint256 value
    // ) external payable {
    //     uint256[] memory payload = new uint256[](1);
    //     payload[0] = value;

    //     _starknetMessaging.sendMessageToL2{value: msg.value}(
    //         contractAddress,
    //         selector,
    //         payload
    //     );
    // }
}
