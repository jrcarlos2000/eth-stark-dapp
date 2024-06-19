//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@starknet/IStarknetMessaging.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrossChainCrowdfundL1 is Ownable {
    IStarknetMessaging internal _starknetMessaging;
    uint256 internal _l2ContractAddress;

    uint256 public CREATE_CAMPAIGN_FROM_L1_SELECTOR =
        0xf1f0e6e952e8d07dfa197200b7e68e92bf9d918634cad516669544a537c044; // create_campaign_from_l1 function on l2

    enum CampaignType {
        ETHEREUM,
        STARKNET
    }

    struct Campaign {
        uint256 targetAmount;
        uint256 raisedAmount;
        address token;
        uint256 deadline;
        string dataCid;
    }

    uint256 campaignCounter = 1;
    mapping(uint256 => Campaign) campaigns;
    mapping(address => address) l1ToL2Token;

    constructor(address starknetMessaging) Ownable(msg.sender) {
        _starknetMessaging = IStarknetMessaging(starknetMessaging);
    }

    function setUpTargetContract(uint256 l2ContractAddress) external onlyOwner {
        _l2ContractAddress = l2ContractAddress;
    }

    function setL2Token(address l1Token, address l2Token) external onlyOwner {
        l1ToL2Token[l1Token] = l2Token;
    }

    function createCampaign(
        uint8 campaignType,
        uint256 targetAmount,
        address token,
        uint256 timeLeft,
        string memory dataCid
    ) external payable {
        if (CampaignType(campaignType) == CampaignType.ETHEREUM) {
            campaigns[campaignCounter] = Campaign({
                targetAmount: targetAmount,
                raisedAmount: 0,
                token: token,
                deadline: block.timestamp + timeLeft,
                dataCid: dataCid
            });
            campaignCounter++;
        } else (CampaignType(campaignType) == CampaignType.STARKNET) {
            uint256[] memory payload = new uint256[](4);
            payload[0] = targetAmount;
            payload[1] = uint256(uint160(token));
            payload[2] = timeLeft;
            payload[3] = uint256(uint160(address(msg.sender)));
            _starknetMessaging.sendMessageToL2{value: msg.value}(
                _l2ContractAddress,
                CREATE_CAMPAIGN_FROM_L1_SELECTOR,
                payload
            );
        }
    }

    function withdraw(uint256 campaignId) external {
        // _starknetMessaging.sendMessageToL2{value: msg.value}(
        //     l2ContractAddress,
        //     SINGLE_VALUE_L2_SELECTOR,
        //     payload
        // );
    }

    function sendMessage(
        uint256 l2ContractAddress,
        uint256 randomNumber
    ) external payable {
        uint256[] memory payload = new uint256[](1);
        payload[0] = randomNumber;

        _starknetMessaging.sendMessageToL2{value: msg.value}(
            l2ContractAddress,
            CREATE_CAMPAIGN_FROM_L1_SELECTOR,
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
