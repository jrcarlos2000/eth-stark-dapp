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
    token: ContractAddress,
    deadline: u256,
    data_cid: ByteArray,
    campaign_type: u8, // 1 ethereum, 2 starknet 
}

#[starknet::interface]
pub trait ICrossChainCrowdfundL2<TContractState> {
    fn create_campaign(ref self: TContractState, target_amount: u256, time_left : u256, token: ContractAddress, data_cid: ByteArray);


    // view functions
    fn get_campaign_counter(self: @TContractState) -> u256;
    fn get_campaign_cid(self: @TContractState, campaign_id: u256) -> ByteArray;
    fn get_campaign_token(self: @TContractState, campaign_id: u256) -> ContractAddress;
    fn get_campaign_data_cid(self: @TContractState, campaign_id: u256) -> (u256, u256, u256, u8); // target_amount, raised_amount, deadline, campaign_type
}

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
        ValueReceivedFromL1: ValueReceived,
        StructReceivedFromL1: StructReceived,
    }

    #[derive(Drop, starknet::Event)]
    struct ValueReceived {
        #[key]
        l1_address: felt252,
        value: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct StructReceived {
        #[key]
        l1_address: felt252,
        data_a: felt252,
        data_b: felt252,
    }


    #[storage]
    struct Storage {
        campaign_counter: u256,
        // campagin related mapppings
        campaign_target_amount: LegacyMap<u256, u256>,
        campaign_raised_amount: LegacyMap<u256, u256>,
        campaign_token: LegacyMap<u256, ContractAddress>,
        campaign_deadline: LegacyMap<u256, u256>,
        campaign_data_cid: LegacyMap<u256, ByteArray>,
        campaign_type: LegacyMap<u256, u8>,

        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl CrossChainCrowdfundL2Impl of ICrossChainCrowdfundL2<ContractState> {
        fn create_campaign(ref self: ContractState, target_amount: u256, time_left : u256, token: ContractAddress, data_cid: ByteArray) {
            self._create_campaign(target_amount, time_left, token, data_cid , 2);
        }
        fn get_campaign_counter(self: @ContractState) -> u256 {
            self.campaign_counter.read()
        }
        fn get_campaign_cid(self: @ContractState, campaign_id: u256) -> ByteArray {
            self.campaign_data_cid.read(campaign_id)
        }
        fn get_campaign_token(self: @ContractState, campaign_id: u256) -> ContractAddress {
            self.campaign_token.read(campaign_id)
        }
        fn get_campaign_data_cid(self: @ContractState, campaign_id: u256) -> (u256, u256, u256, u8) {
            let target_amount = self.campaign_target_amount.read(campaign_id);
            let raised_amount = self.campaign_raised_amount.read(campaign_id);
            let deadline = self.campaign_deadline.read(campaign_id);
            let campaign_type = self.campaign_type.read(campaign_id);
            (target_amount, raised_amount, deadline, campaign_type)
        }
    }

    #[l1_handler]
    fn create_campaign_from_l1(ref self: ContractState, from_address: felt252, l1_campaign: L1Campaign) {
        let target_amount: u256 = l1_campaign.targetAmount.try_into().unwrap();
        let mut time_left: u256 = l1_campaign.timeLeft.try_into().unwrap();
        let token:ContractAddress = l1_campaign.token.try_into().unwrap();
        let buffer_time:u256 = 15;  // 15 seconds
        time_left = time_left - buffer_time;
        self._create_campaign(target_amount, time_left, token, "", 1);
    }

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
        fn _create_campaign(ref self: ContractState, target_amount: u256, time_left : u256, token: ContractAddress, dataCid: ByteArray, campaign_type: u8) {
            // creates a campaign on this contract
            let block_timestamp:u256 = get_block_timestamp().try_into().unwrap();
            let campaign_id = self.campaign_counter.read();
            self.campaign_counter.write(campaign_id + 1);
            self.campaign_target_amount.write(campaign_id, target_amount);
            self.campaign_raised_amount.write(campaign_id, 0);
            self.campaign_token.write(campaign_id, token);
            self.campaign_deadline.write(campaign_id, block_timestamp + time_left);
            self.campaign_data_cid.write(campaign_id, dataCid);
            self.campaign_type.write(campaign_id, campaign_type);
        }
    }

}