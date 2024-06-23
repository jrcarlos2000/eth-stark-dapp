//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@starknet/IStarknetMessaging.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @author Carlos Ramos
/// @notice missing handling of deadlines in a crosschain context, we can use checkpoints for it
/// @dev when claiming from a different chain, add a cooldown time, like 15 mins before.

contract CrossChainCrowdfundL1 is Ownable {
    IStarknetMessaging public _starknetMessaging;
    uint256 internal _l2ContractAddress;
    address internal _baseToken;

    uint256 public SET_SUCCESSFUL_CAMPAIGN =
        0x2f2311889ce7c6dd0861f57466ac4f28b41ea2c5dadef8c603c6cbabaa5714e; // set_successful_campaign function on l2

    struct EthCampaign {
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 duration;
        uint256 startTime;
        string dataCid;
        address owner;
        bool isActive;
    }

    struct StrkCampaign {
        uint256 raisedAmount;
    }

    event EthCampaignCreated(
        uint256 campaignId,
        uint256 owner,
        uint256 targetAmount,
        uint256 deadline,
        string dataCid
    );

    uint256 campaignCounter = 1;
    mapping(uint256 => EthCampaign) public campaigns;
    mapping(uint256 => StrkCampaign) public strkCampaigns;

    constructor(
        address starknetMessaging,
        address baseToken
    ) Ownable(msg.sender) {
        _starknetMessaging = IStarknetMessaging(starknetMessaging);
        _baseToken = baseToken;
    }

    function setUpTargetContract(uint256 l2ContractAddress) external onlyOwner {
        _l2ContractAddress = l2ContractAddress;
    }

    function createCampaign(
        uint256 targetAmount,
        uint256 duration,
        string memory dataCid
    ) external {
        campaigns[campaignCounter] = EthCampaign({
            targetAmount: targetAmount,
            raisedAmount: 0,
            duration: duration,
            startTime: block.timestamp,
            dataCid: dataCid,
            owner: msg.sender,
            isActive: true
        });
        emit EthCampaignCreated(
            campaignCounter,
            uint256(uint160(msg.sender)),
            targetAmount,
            block.timestamp + duration,
            dataCid
        );
        campaignCounter++;
    }

    function depositToEthCampaign(
        uint256 campaignId,
        uint256 amount
    ) external payable {
        EthCampaign memory _EthCampaign = campaigns[campaignId];
        require(_EthCampaign.isActive == true, "Campaign is still active");
        IERC20(_baseToken).transferFrom(
            address(msg.sender),
            address(this),
            amount
        );
        _EthCampaign.raisedAmount += amount;
        campaigns[campaignId] = _EthCampaign;
    }

    function campaignOwnerWithdraw(
        uint256 campaignId,
        uint256 l2recipient
    ) external payable {
        EthCampaign memory _EthCampaign = campaigns[campaignId];
        require(
            _EthCampaign.owner == msg.sender,
            "Only the owner can withdraw"
        );
        require(_EthCampaign.isActive == true, "Campaign is still active");
        _EthCampaign.isActive = false;

        uint256 amount = _EthCampaign.raisedAmount;
        _EthCampaign.raisedAmount = 0;
        IERC20(_baseToken).transfer(address(uint160(l2recipient)), amount);

        campaigns[campaignId] = _EthCampaign;

        // l2 message
        uint256[] memory payload = new uint256[](2);
        payload[0] = campaignId;
        payload[1] = l2recipient;
        _starknetMessaging.sendMessageToL2{value: msg.value}(
            _l2ContractAddress,
            SET_SUCCESSFUL_CAMPAIGN,
            payload
        );
    }

    // note: match starknet contract call
    function getAllCampaignsData()
        external
        view
        returns (EthCampaign[] memory)
    {
        EthCampaign[] memory allCampaigns = new EthCampaign[](campaignCounter);
        for (uint256 i = 1; i < campaignCounter; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    // function createCampaign(
    //     uint8 campaignType,
    //     uint256 targetAmount,
    //     address token,
    //     uint256 timeLeft,
    //     string memory dataCid
    // ) external payable {
    //     if (CampaignType(campaignType) == CampaignType.ETHEREUM) {
    //         campaigns[campaignCounter] = Campaign({
    //             targetAmount: targetAmount,
    //             raisedAmount: 0,
    //             token: token,
    //             deadline: block.timestamp + timeLeft,
    //             dataCid: dataCid
    //         });
    //         campaignCounter++;
    //     } else (CampaignType(campaignType) == CampaignType.STARKNET) {
    //         uint256[] memory payload = new uint256[](4);
    //         payload[0] = targetAmount;
    //         payload[1] = uint256(uint160(token));
    //         payload[2] = timeLeft;
    //         payload[3] = uint256(uint160(address(msg.sender)));
    //         _starknetMessaging.sendMessageToL2{value: msg.value}(
    //             _l2ContractAddress,
    //             CREATE_CAMPAIGN_FROM_L1_SELECTOR,
    //             payload
    //         );
    //     }
    // }

    function withdraw(uint256 campaignId) external {
        // _starknetMessaging.sendMessageToL2{value: msg.value}(
        //     l2ContractAddress,
        //     SINGLE_VALUE_L2_SELECTOR,
        //     payload
        // );
    }

    // function sendMessage(
    //     uint256 l2ContractAddress,
    //     uint256 randomNumber
    // ) external payable {
    //     uint256[] memory payload = new uint256[](1);
    //     payload[0] = randomNumber;

    //     _starknetMessaging.sendMessageToL2{value: msg.value}(
    //         l2ContractAddress,
    //         SET_SUCCESSFUL_CAMPAIGN,
    //         payload
    //     );
    // }

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
