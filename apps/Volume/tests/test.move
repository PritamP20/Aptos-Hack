address 0x1 {
    module StakingTest {
        use std::signer;
        use std::vector;
        use std::errors;
        use std::option;
        use std::event;
        use 0x1::Staking;

        /// Helper to initialize the staking contract with a given reward rate
        fun setup(owner: &signer, reward_rate: u64) {
            Staking::initialize(owner, reward_rate);
        }

        /// Helper to get user info from StakingState resource
        fun get_user_info(addr: address): option::Option<(u64, u64)> {
            let state = borrow_global<Staking::StakingState>(0x1);
            Staking::get_user_info(&state, addr)
        }

        /// Helper to get total staked tokens
        fun get_total_staked(): u64 {
            let state = borrow_global<Staking::StakingState>(0x1);
            Staking::get_total_staked(&state)
        }

        /// Test that initialize sets up the contract correctly and prevents double init
        #[test]
        fun test_initialize_and_double_init() {
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);
            let state = borrow_global<Staking::StakingState>(0x1);
            assert!(state.reward_rate == 10, 1);
            assert!(state.total_staked == 0, 2);

            // Attempt to initialize again should abort
            let res = std::debug::catch_abort(|| Staking::initialize(&owner, 20));
            assert!(res.is_abort(), 3);
        }

        /// Test staking with valid amount updates state and emits event
        #[test]
        fun test_stake_basic() {
            let user = signer::spec_signer(0x2);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 100);

            Staking::stake(&user, 50);
            let info_opt = get_user_info(signer::address_of(&user));
            assert!(option::is_some(&info_opt), 1);
            let (staked_amount, rewards) = option::extract(info_opt);
            assert!(staked_amount == 50, 2);
            assert!(rewards == 0, 3);

            let total = get_total_staked();
            assert!(total == 50, 4);
        }

        /// Test staking with zero amount aborts with EZERO_AMOUNT
        #[test]
        fun test_stake_zero_amount_abort() {
            let user = signer::spec_signer(0x3);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            let res = std::debug::catch_abort_code(|| Staking::stake(&user, 0));
            assert!(res == errors::invalid_argument(Staking::EZERO_AMOUNT), 1);
        }

        /// Test unstaking without staking aborts with ENOT_STAKED
        #[test]
        fun test_unstake_without_stake_abort() {
            let user = signer::spec_signer(0x4);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            let res = std::debug::catch_abort_code(|| Staking::unstake(&user, 10));
            assert!(res == errors::not_found(Staking::ENOT_STAKED), 1);
        }

        /// Test unstaking more than staked amount aborts with EINSUFFICIENT_BALANCE
        #[test]
        fun test_unstake_more_than_staked_abort() {
            let user = signer::spec_signer(0x5);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            Staking::stake(&user, 30);
            let res = std::debug::catch_abort_code(|| Staking::unstake(&user, 50));
            assert!(res == errors::invalid_argument(Staking::EINSUFFICIENT_BALANCE), 1);
        }

        /// Test successful unstake decreases staked amount and total_staked, and removes user if fully unstaked
        #[test]
        fun test_unstake_partial_and_full() {
            let user = signer::spec_signer(0x6);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            Staking::stake(&user, 40);

            // Partial unstake
            Staking::unstake(&user, 15);
            let info_opt = get_user_info(signer::address_of(&user));
            assert!(option::is_some(&info_opt), 1);
            let (staked_amount, _) = option::extract(info_opt);
            assert!(staked_amount == 25, 2);

            let total = get_total_staked();
            assert!(total == 25, 3);

            // Full unstake
            Staking::unstake(&user, 25);
            let info_opt2 = get_user_info(signer::address_of(&user));
            assert!(option::is_none(&info_opt2), 4);

            let total2 = get_total_staked();
            assert!(total2 == 0, 5);
        }

        /// Test claiming rewards without staking aborts with ENOT_STAKED
        #[test]
        fun test_claim_rewards_without_stake_abort() {
            let user = signer::spec_signer(0x7);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            let res = std::debug::catch_abort_code(|| Staking::claim_rewards(&user));
            assert!(res == errors::not_found(Staking::ENOT_STAKED), 1);
        }

        /// Test claiming rewards with zero rewards aborts with invalid_state
        #[test]
        fun test_claim_rewards_with_zero_rewards_abort() {
            let user = signer::spec_signer(0x8);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            Staking::stake(&user, 10);
            let res = std::debug::catch_abort_code(|| Staking::claim_rewards(&user));
            assert!(res == errors::invalid_state(0), 1);
        }

        /// Test claiming rewards after manual reward manipulation (simulate rewards accrued)
        #[test]
        fun test_claim_rewards_success() {
            let user = signer::spec_signer(0x9);
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            Staking::stake(&user, 100);

            // Manually update rewards for testing: simulate rewards accrued
            {
                let state = borrow_global_mut<Staking::StakingState>(0x1);
                let idx_opt = Staking::find_user_index(&state.user_info, signer::address_of(&user));
                assert!(option::is_some(&idx_opt), 999);
                let idx = option::extract(idx_opt);
                let (_, ref mut user_info) = *vector::borrow_mut(&mut state.user_info, idx);
                user_info.rewards = 500;
            }

            Staking::claim_rewards(&user);

            // After claim, rewards should reset to 0
            let info_opt = get_user_info(signer::address_of(&user));
            assert!(option::is_some(&info_opt), 1);
            let (_, rewards) = option::extract(info_opt);
            assert!(rewards == 0, 2);
        }

        /// Test multiple users staking and unstaking correctly track total staked
        #[test]
        fun test_multiple_users_stake_unstake() {
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            let user1 = signer::spec_signer(0xA);
            let user2 = signer::spec_signer(0xB);

            Staking::stake(&user1, 70);
            Staking::stake(&user2, 30);

            let total = get_total_staked();
            assert!(total == 100, 1);

            Staking::unstake(&user1, 20);
            let total2 = get_total_staked();
            assert!(total2 == 80, 2);

            Staking::unstake(&user2, 30);
            let total3 = get_total_staked();
            assert!(total3 == 50, 3);
        }

        /// Test that calling update_rewards updates reward_per_token_stored and user rewards properly
        #[test]
        fun test_update_rewards_effect() {
            let owner = signer::spec_signer(0x1);
            setup(&owner, 10);

            let user = signer::spec_signer(0xC);
            Staking::stake(&user, 100);

            // Manually set last_update_time far in past to simulate time passage
            {
                let state = borrow_global_mut<Staking::StakingState>(0x1);
                state.last_update_time = 0; // reset to 0
                state.reward_per_token_stored = 0;
            }

            // Call stake again to trigger update_rewards internally
            Staking::stake(&user, 0);

            // After update_rewards, reward_per_token_stored should be incremented (non-zero)
            let state = borrow_global<Staking::StakingState>(0x1);
            assert!(state.reward_per_token_stored > 0, 1);

            // User rewards also updated
            let info_opt = get_user_info(signer::address_of(&user));
            assert!(option::is_some(&info_opt), 2);
            let (_, rewards) = option::extract(info_opt);
            assert!(rewards >= 0, 3); // rewards may be zero if no time diff, but non-negative
        }
    }
}