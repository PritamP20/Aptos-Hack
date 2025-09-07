address 0x1 {
    module Staking {

        use std::signer;
        use std::vector;
        use std::errors;
        use std::event;

        /// Error codes
        const ENOT_STAKED: u64 = 1;
        const EINSUFFICIENT_BALANCE: u64 = 2;
        const ENOT_AUTHORIZED: u64 = 3;
        const EZERO_AMOUNT: u64 = 4;

        /// Event emitted when a user stakes tokens
        struct StakedEvent has copy, drop, store {
            staker: address,
            amount: u64,
        }

        /// Event emitted when a user unstakes tokens
        struct UnstakedEvent has copy, drop, store {
            staker: address,
            amount: u64,
        }

        /// Event emitted when a user claims rewards
        struct RewardPaidEvent has copy, drop, store {
            staker: address,
            amount: u64,
        }

        /// Resource storing all staking-related state
        struct StakingState has key {
            total_staked: u64,
            reward_rate: u64, // reward tokens per staked token per epoch (or unit of time)
            last_update_time: u64,
            reward_per_token_stored: u64,
            /// Mapping from user address to UserInfo
            user_info: vector<(address, UserInfo)>,
            staked_event_handle: event::EventHandle<StakedEvent>,
            unstaked_event_handle: event::EventHandle<UnstakedEvent>,
            reward_paid_event_handle: event::EventHandle<RewardPaidEvent>,
        }

        /// Struct to store individual user staking info
        struct UserInfo has copy, drop, store {
            amount: u64,
            reward_debt: u64,
            rewards: u64,
            last_stake_time: u64,
        }

        /// Initializes staking state under the deployer (owner) account
        public fun initialize(owner: &signer, reward_rate: u64) {
            assert!(!exists<StakingState>(signer::address_of(owner)), errors::already_exists(0));
            let state = StakingState {
                total_staked: 0,
                reward_rate,
                last_update_time: 0,
                reward_per_token_stored: 0,
                user_info: vector::empty(),
                staked_event_handle: event::new_event_handle<StakedEvent>(owner),
                unstaked_event_handle: event::new_event_handle<UnstakedEvent>(owner),
                reward_paid_event_handle: event::new_event_handle<RewardPaidEvent>(owner),
            };
            move_to(owner, state);
        }

        /// Internal helper: Find user info by address, returns index or none
        fun find_user_index(user_info: &vector<(address, UserInfo)>, user: address): option::Option<u64> {
            let length = vector::length(user_info);
            let mut i = 0;
            while (i < length) {
                let (addr, _) = *vector::borrow(user_info, i);
                if (addr == user) {
                    return option::some(i);
                };
                i = i + 1;
            };
            option::none()
        }

        /// Internal helper: Update rewards accounting for a user
        fun update_rewards(state: &mut StakingState, user_addr: address) {
            let current_time = timestamp();
            let time_diff = current_time - state.last_update_time;
            if (state.total_staked > 0 && time_diff > 0) {
                // Calculate new reward per token
                let additional_reward_per_token = (time_diff * state.reward_rate * 1_000_000) / state.total_staked;
                state.reward_per_token_stored = state.reward_per_token_stored + additional_reward_per_token;
            };
            state.last_update_time = current_time;

            // Update user's rewards
            let user_index_opt = find_user_index(&state.user_info, user_addr);
            if (option::is_some(&user_index_opt)) {
                let idx = option::extract(user_index_opt);
                let (_, ref mut user_info) = *vector::borrow_mut(&mut state.user_info, idx);
                let earned = (user_info.amount * (state.reward_per_token_stored - user_info.reward_debt)) / 1_000_000;
                user_info.rewards = user_info.rewards + earned;
                user_info.reward_debt = state.reward_per_token_stored;
            }
        }

        /// Public entry function to stake tokens
        /// Note: This example does not handle token transfer; assumes tokens are managed off-chain or externally.
        public entry fun stake(user: &signer, amount: u64) acquires StakingState {
            assert!(amount > 0, errors::invalid_argument(EZERO_AMOUNT));
            let addr = signer::address_of(user);
            let state = borrow_global_mut<StakingState>(0x1);

            // Update rewards for this user before changing amount
            update_rewards(state, addr);

            let user_index_opt = find_user_index(&state.user_info, addr);
            if (option::is_some(&user_index_opt)) {
                let idx = option::extract(user_index_opt);
                let (_, ref mut user_info) = *vector::borrow_mut(&mut state.user_info, idx);
                user_info.amount = user_info.amount + amount;
                user_info.reward_debt = state.reward_per_token_stored;
                user_info.last_stake_time = timestamp();
            } else {
                let new_user_info = UserInfo {
                    amount,
                    reward_debt: state.reward_per_token_stored,
                    rewards: 0,
                    last_stake_time: timestamp(),
                };
                vector::push_back(&mut state.user_info, (addr, new_user_info));
            }

            state.total_staked = state.total_staked + amount;

            // Emit stake event
            event::emit_event(&mut state.staked_event_handle, StakedEvent { staker: addr, amount });

        }

        /// Public entry function to unstake tokens
        public entry fun unstake(user: &signer, amount: u64) acquires StakingState {
            assert!(amount > 0, errors::invalid_argument(EZERO_AMOUNT));
            let addr = signer::address_of(user);
            let state = borrow_global_mut<StakingState>(0x1);

            // Update rewards for this user before changing amount
            update_rewards(state, addr);

            let user_index_opt = find_user_index(&state.user_info, addr);
            assert!(option::is_some(&user_index_opt), errors::not_found(ENOT_STAKED));
            let idx = option::extract(user_index_opt);
            let (_, ref mut user_info) = *vector::borrow_mut(&mut state.user_info, idx);
            assert!(user_info.amount >= amount, errors::invalid_argument(EINSUFFICIENT_BALANCE));

            user_info.amount = user_info.amount - amount;
            user_info.reward_debt = state.reward_per_token_stored;

            state.total_staked = state.total_staked - amount;

            // If user fully unstaked, remove from vector (simple swap remove)
            if (user_info.amount == 0) {
                let length = vector::length(&state.user_info);
                if (idx < length - 1) {
                    let last = vector::pop_back(&mut state.user_info);
                    vector::borrow_mut(&mut state.user_info, idx).copy_from(&last);
                } else {
                    vector::pop_back(&mut state.user_info);
                }
            }

            // Emit unstake event
            event::emit_event(&mut state.unstaked_event_handle, UnstakedEvent { staker: addr, amount });
        }

        /// Public entry function to claim accumulated rewards
        public entry fun claim_rewards(user: &signer) acquires StakingState {
            let addr = signer::address_of(user);
            let state = borrow_global_mut<StakingState>(0x1);

            update_rewards(state, addr);

            let user_index_opt = find_user_index(&state.user_info, addr);
            assert!(option::is_some(&user_index_opt), errors::not_found(ENOT_STAKED));
            let idx = option::extract(user_index_opt);
            let (_, ref mut user_info) = *vector::borrow_mut(&mut state.user_info, idx);

            let reward = user_info.rewards;
            assert!(reward > 0, errors::invalid_state(0));

            user_info.rewards = 0;

            // Emit reward paid event
            event::emit_event(&mut state.reward_paid_event_handle, RewardPaidEvent { staker: addr, amount: reward });

            // Note: Actual token transfer of rewards should be implemented here as needed.
        }

        /// View function to get a user's staked amount and pending rewards
        public fun get_user_info(state: &StakingState, user: address): option::Option<(u64, u64)> {
            let user_index_opt = find_user_index(&state.user_info, user);
            if (option::is_some(&user_index_opt)) {
                let idx = option::extract(user_index_opt);
                let (_, user_info) = *vector::borrow(&state.user_info, idx);
                Some((user_info.amount, user_info.rewards))
            } else {
                option::none()
            }
        }

        /// View function to get total staked tokens
        public fun get_total_staked(state: &StakingState): u64 {
            state.total_staked
        }

        /// Internal helper to get current timestamp (mock-up, may differ on actual chain)
        fun timestamp(): u64 {
            // Placeholder for actual timestamp retrieval
            0
        }
    }
}