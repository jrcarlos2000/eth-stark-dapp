use starknet::{ContractAddress, get_block_timestamp};

#[derive(Drop, Serde)]
struct L1Campaign {
    targetAmount: felt252,
    token: felt252,
    timeLeft: felt252,
    creator: felt252,
}


struct Campaign {
    target_amount: u256,
    raised_amount: u256,
    duration: u256,
    start_time: u256,
    data_cid: ByteArray,
}

#[starknet::interface]
pub trait ICrossChainCrowdfundL2<TContractState> {
    fn create_campaign(ref self: TContractState, target_amount: u256, duration : u256, data_cid: ByteArray);
    
    // ethereum campaign
    fn deposit_to_eth_campaign(ref self: TContractState, eth_campaign_id: u256, amount: u256);
    fn deposit_to_strk_campaign(ref self: TContractState, strk_campaign_id: u256, amount: u256);

    // view functions
    fn get_strk_campaign_counter(self: @TContractState) -> u256;
    fn get_strk_campaign(self: @TContractState, campaign_id: u256) -> (u256, u256, u256, ByteArray);
}

/// @author Carlos Ramos
/// @notice missing handling of deadlines in a crosschain context, we can use checkpoints for it
/// @dev when claiming from a different chain, add a cooldown time, like 15 mins before.

#[starknet::contract]
mod CrossChainCrowdfundL2 {
    use core::traits::TryInto;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc20::interface::{IERC20CamelDispatcher, IERC20CamelDispatcherTrait};
    use starknet::{get_caller_address, get_contract_address, EthAddress, SyscallResultTrait};
    use starknet::syscalls::send_message_to_l1_syscall;
    use super::{ContractAddress, ICrossChainCrowdfundL2, L1Campaign, Campaign, get_block_timestamp};
    use core::num::traits::Zero;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    const ETH_CONTRACT_ADDRESS: felt252 =
        0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7;

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        StrkCampaignCreated: StrkCampaignCreated,
    }

    #[derive(Drop, starknet::Event)]
    struct StrkCampaignCreated {
        #[key]
        campaign_id: u256,
        owner: ContractAddress,
        target_amount: u256,
        deadline: u256,
        data_cid: ByteArray,
    }


    #[storage]
    struct Storage {
        
        base_token: ContractAddress,

        // starknet campaigns
        strk_campaign_counter: u256,
        strk_campaign_target_amount: LegacyMap<u256, u256>,
        strk_campaign_raised_amount: LegacyMap<u256, u256>,
        strk_campaign_duration: LegacyMap<u256, u256>,
        strk_campaign_start_time: LegacyMap<u256, u256>,
        strk_campaign_data_cid: LegacyMap<u256, ByteArray>,
        strk_campaign_owner: LegacyMap<u256, ContractAddress>,

        // ethereum campaigns
        eth_campaign_amount_raised: LegacyMap<u256, u256>,

        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, base_token: ContractAddress) {
        self.ownable.initializer(owner);
        self.strk_campaign_counter.write(1);
        self.base_token.write(base_token);
    }

    #[abi(embed_v0)]
    impl CrossChainCrowdfundL2Impl of ICrossChainCrowdfundL2<ContractState> {
        fn create_campaign(ref self: ContractState, target_amount: u256, duration : u256, data_cid: ByteArray) {
            self._create_campaign(target_amount, duration, data_cid);
        }

        fn get_strk_campaign_counter(self: @ContractState) -> u256 {
            self.strk_campaign_counter.read()
        }

        fn get_strk_campaign(self: @ContractState, campaign_id: u256) -> (u256, u256, u256, ByteArray) {
            let target_amount = self.strk_campaign_target_amount.read(campaign_id);
            let raised_amount = self.strk_campaign_raised_amount.read(campaign_id);
            let deadline = self.strk_campaign_duration.read(campaign_id) + self.strk_campaign_start_time.read(campaign_id);
            let data_cid = self.strk_campaign_data_cid.read(campaign_id);
            (target_amount, raised_amount, deadline, data_cid)
        }


        fn deposit_to_eth_campaign(ref self: ContractState, eth_campaign_id: u256, amount: u256) {
            // use base token
            let token = self.base_token.read();
            let is_success = IERC20CamelDispatcher { contract_address: token }.transferFrom(get_caller_address(), get_contract_address(), amount);
            assert(is_success, 'transfer failed');

            let raised_amount = self.eth_campaign_amount_raised.read(eth_campaign_id);
            self.eth_campaign_amount_raised.write(eth_campaign_id, raised_amount + amount);

            // TODO store the amount raised by each user
        }

        fn deposit_to_strk_campaign(ref self: ContractState, strk_campaign_id: u256, amount: u256) {
            // use base token
            let token = self.base_token.read();
            let is_success = IERC20CamelDispatcher { contract_address: token }.transferFrom(get_caller_address(), get_contract_address(), amount);
            assert(is_success, 'transfer failed');

            let raised_amount = self.strk_campaign_raised_amount.read(strk_campaign_id);
            self.strk_campaign_raised_amount.write(strk_campaign_id, raised_amount + amount);
        }
    }

    // #[l1_handler]
    // fn create_campaign_from_l1(ref self: ContractState, from_address: felt252, l1_campaign: L1Campaign) {
    //     let target_amount: u256 = l1_campaign.targetAmount.try_into().unwrap();
    //     let mut time_left: u256 = l1_campaign.timeLeft.try_into().unwrap();
    //     let token:ContractAddress = l1_campaign.token.try_into().unwrap();
    //     let buffer_time:u256 = 15;  // 15 seconds
    //     time_left = time_left - buffer_time;
    //     self._create_campaign(target_amount, time_left, token, "", 1);
    // }

    /// Handles a message received from L1.
    /// In this example, the handler is expecting the data members to both be greater than 0.
    ///
    /// # Arguments
    ///
    /// * `from_address` - The L1 contract sending the message.
    /// * `data` - Expected data in the payload (automatically deserialized by cairo).
    // #[l1_handler]
    // fn msg_handler_struct(ref self: ContractState, from_address: felt252, l1Campaign: L1Campaign) {


    //     // assert(from_address == ...);
    //     // assert(!data.a.is_zero(), 'data.a is invalid');
    //     // assert(!data.b.is_zero(), 'data.b is invalid');

    //     // self.emit(StructReceived { l1_address: from_address, data_a: data.a, data_b: data.b, });
    // }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _create_campaign(ref self: ContractState, target_amount: u256, duration : u256, data_cid: ByteArray) {
            // creates a campaign on this contract
            let block_timestamp:u256 = get_block_timestamp().try_into().unwrap();
            let campaign_id = self.strk_campaign_counter.read();
            self.strk_campaign_counter.write(campaign_id + 1);
            self.strk_campaign_target_amount.write(campaign_id, target_amount);
            self.strk_campaign_raised_amount.write(campaign_id, 0);
            self.strk_campaign_duration.write(campaign_id, duration);
            self.strk_campaign_start_time.write(campaign_id, block_timestamp);
            self.strk_campaign_data_cid.write(campaign_id, data_cid.clone());
            self.strk_campaign_owner.write(campaign_id, get_caller_address());
            self.emit(StrkCampaignCreated { campaign_id: campaign_id, owner: get_caller_address(), target_amount, deadline: block_timestamp + duration, data_cid });
        }
    }

}