use starknet::ContractAddress;

#[derive(Drop, Serde)]
struct MyData {
    a: felt252,
    b: felt252,
}

#[starknet::interface]
pub trait IL2MessageContract<TContractState> {
}

#[starknet::contract]
mod L2MessageContract {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc20::interface::{IERC20CamelDispatcher, IERC20CamelDispatcherTrait};
    use starknet::{get_caller_address, get_contract_address, EthAddress, SyscallResultTrait};
    use starknet::syscalls::send_message_to_l1_syscall;
    use super::{ContractAddress, IL2MessageContract, MyData};
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
        some_value: felt252,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl L2MessageContractImpl of IL2MessageContract<ContractState> {
    }

    // -----------------------------------------
    // -------- L1 - L2 Messaging --------------
    // -----------------------------------------

    #[l1_handler]
    fn msg_handler_value(ref self: ContractState, from_address: felt252, value: felt252) {
        // assert(from_address == ...);

        self.some_value.write(value);
        self.emit(ValueReceived { l1_address: from_address, value, });
    }

    /// Handles a message received from L1.
    /// In this example, the handler is expecting the data members to both be greater than 0.
    ///
    /// # Arguments
    ///
    /// * `from_address` - The L1 contract sending the message.
    /// * `data` - Expected data in the payload (automatically deserialized by cairo).
    #[l1_handler]
    fn msg_handler_struct(ref self: ContractState, from_address: felt252, data: MyData) {
        // assert(from_address == ...);

        assert(!data.a.is_zero(), 'data.a is invalid');
        assert(!data.b.is_zero(), 'data.b is invalid');

        self.emit(StructReceived { l1_address: from_address, data_a: data.a, data_b: data.b, });
    }

}
