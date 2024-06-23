// SPDX-License-Identifier: MIT
// @author : Carlos Ramos
// @notice :  contract handles all interactions related to l1 campaigns
#[starknet::interface]
pub trait ICrossFundMessenger<TContractState> {
    fn get_cross_chain_campaign(self : @TContractState, campaign_id: u256) -> (u256, u8);
}
#[starknet::component]
pub mod CrossFundMessengerComponent {
    use starknet::EthAddress;
    use super::{ICrossFundMessenger};

    #[storage]
    struct Storage {
        // the target contract on l1
        target_contract: EthAddress,
        campaign_amount_raised: LegacyMap<u256, u256>, // TODO use checkpoints
        campaign_status: LegacyMap<u256, u8>, // active : 0, inactive : 1
    }


    #[embeddable_as(CrossFundMessengerImpl)]
    impl CrossFundMessenger<TContractState, +HasComponent<TContractState>> of ICrossFundMessenger<ComponentState<TContractState>>{
        fn get_cross_chain_campaign(self: @ComponentState<TContractState>, campaign_id: u256) -> (u256, u8) {
            let amount_raised = self.campaign_amount_raised.read(campaign_id);
            let status = self.campaign_status.read(campaign_id);
            (amount_raised, status)
        }
    }

    #[generate_trait]
    pub impl InternalImpl<TContractState, +HasComponent<TContractState>> of InternalTrait<TContractState> {
        fn _increase_campaign_balance(
            ref self: ComponentState<TContractState>,
            campaign_id: u256,
            amount: u256,
        ) {
            let current_balance = self.campaign_amount_raised.read(campaign_id);
            let new_balance = current_balance + amount;
            self.campaign_amount_raised.write(campaign_id, new_balance);
        }
    }
}