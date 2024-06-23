// SPDX-License-Identifier: MIT
// @author : Carlos Ramos
// @notice :  contract handles all interactions related to native chain campaigns
#[starknet::interface]
pub trait ICrossFundNative<TContractState> {
    // setters
    // fn create_native_campaign(ref self: TContractState, target_amount: u256, duration : u256, data_cid: ByteArray);
    // fn deposit_native(ref self: TContractState, campaign_id: u256, amount: u256);

    // // getters
    // fn get_native_campaign(self: @TContractState, campaign_id: u256) -> (u256, u8);
}
#[starknet::component]
pub mod CrossFundNativeComponent {
    use starknet::{EthAddress, ContractAddress};
    use super::{ICrossFundNative};

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
        strk_campaign_is_active: LegacyMap<u256, bool>,

        // ethereum campaigns
        eth_campaign_amount_raised: LegacyMap<u256, u256>,
    }

    #[embeddable_as(CrossFundNativeImpl)]
    impl CrossFundNative<TContractState, +HasComponent<TContractState>> of ICrossFundNative<ComponentState<TContractState>>{
    }

    #[generate_trait]
    pub impl InternalImpl<TContractState, +HasComponent<TContractState>> of InternalTrait<TContractState> {
    }
}