//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
   @notice Interface related to local messaging for Starknet.
*/
interface IMockStarknetMessaging {
    function addMessageHashesFromL2(
        uint256[] calldata msgHashes
    ) external payable;
}
