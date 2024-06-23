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

    uint256 public L1_MESSAGE =
        0x3ed916ce45b46db122d7ebf0041611edc7974ee693102ae069e6c28d0afc8f9; // l1_message function on l2

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
        bool isActive;
        uint256 raisedAmount;
    }

    event EthCampaignCreated(
        uint256 campaignId,
        uint256 owner,
        uint256 targetAmount,
        uint256 deadline,
        string dataCid
    );

    enum CampaignType {
        ETH,
        STRK
    }

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

    function depositToEthCampaign(uint256 campaignId, uint256 amount) external {
        EthCampaign memory _EthCampaign = campaigns[campaignId];
        require(_EthCampaign.isActive == true, "Campaign is still active");
        IERC20(_baseToken).transferFrom(msg.sender, address(this), amount);
        _EthCampaign.raisedAmount += amount;
        campaigns[campaignId] = _EthCampaign;
    }

    function depositToStrkCampaign(
        uint256 campaignId,
        uint256 amount
    ) external {
        StrkCampaign memory _StrkCampaign = strkCampaigns[campaignId];
        require(_StrkCampaign.isActive == true, "Campaign is still active");
        IERC20(_baseToken).transferFrom(msg.sender, address(this), amount);
        _StrkCampaign.raisedAmount += amount;
        strkCampaigns[campaignId] = _StrkCampaign;
    }

    // TODO: add checks for the campaign to be active and for the address to be valid on l2
    function withdraw(
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

        bool hasRaised = _EthCampaign.raisedAmount >= _EthCampaign.targetAmount;

        if (!hasRaised) {
            // l2 message
            uint256[] memory payload = new uint256[](3);
            payload[0] = campaignId;
            payload[1] = 0;
            payload[2] = l2recipient;
            _starknetMessaging.sendMessageToL2{value: msg.value}(
                _l2ContractAddress,
                L1_MESSAGE,
                payload
            );
        } else {
            uint256 amount = _EthCampaign.raisedAmount;
            _EthCampaign.raisedAmount = 0;
            IERC20(_baseToken).transfer(_EthCampaign.owner, amount);
            campaigns[campaignId] = _EthCampaign;
            // l2 message
            uint256[] memory payload = new uint256[](3);
            payload[0] = campaignId;
            payload[1] = 1;
            payload[2] = l2recipient;
            _starknetMessaging.sendMessageToL2{value: msg.value}(
                _l2ContractAddress,
                L1_MESSAGE,
                payload
            );
        }
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
}
