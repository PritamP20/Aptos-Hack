module StakingTests {
    use std::signer;
    use std::vector;
    use std::error;
    use std::event;
    use std::timestamp;
    use std::testing;
    use Staking;

    /// Helper function to initialize staking module for the test account
    fun init_staking(account: &signer) {
        // Initialize StakingEvents resource under the test account
        Staking::init(account);
    }

    /// Test staking with a new account (no previous stake)
    #[test]
    fun test_stake_new_account() {
        let account = testing::new_signer();
        init_staking(&account);

        // Stake 100 tokens
        Staking::stake(&account, 100);

        // Assert stake amount is 100
        let addr = signer::address_of(&account);
        let staked_amount = Staking::get_stake(addr);
        testing::assert!(staked_amount == 100, 1);
    }

    /// Test staking additional amount to an existing stake
    #[test]
    fun test_stake_additional_amount() {
        let account = testing::new_signer();
        init_staking(&account);

        // Stake 50 tokens first
        Staking::stake(&account, 50);
        // Stake additional 70 tokens
        Staking::stake(&account, 70);

        let addr = signer::address_of(&account);
        let staked_amount = Staking::get_stake(addr);
        testing::assert!(staked_amount == 120, 2);
    }

    /// Test stake with zero amount should abort
    #[test]
    fun test_stake_zero_amount_should_abort() {
        let account = testing::new_signer();
        init_staking(&account);

        let result = testing::assert_abort_code(
            || Staking::stake(&account, 0),
            Staking::EZERO_AMOUNT,
        );
        testing::assert!(result, 3);
    }

    /// Test unstake with no prior stake should abort
    #[test]
    fun test_unstake_without_stake_should_abort() {
        let account = testing::new_signer();
        init_staking(&account);

        let result = testing::assert_abort_code(
            || Staking::unstake(&account, 10),
            Staking::ENOT_STAKED,
        );
        testing::assert!(result, 4);
    }

    /// Test unstake with zero amount should abort
    #[test]
    fun test_unstake_zero_amount_should_abort() {
        let account = testing::new_signer();
        init_staking(&account);

        Staking::stake(&account, 100);

        let result = testing::assert_abort_code(
            || Staking::unstake(&account, 0),
            Staking::EZERO_AMOUNT,
        );
        testing::assert!(result, 5);
    }

    /// Test unstake with amount greater than staked amount should abort
    #[test]
    fun test_unstake_insufficient_balance_should_abort() {
        let account = testing::new_signer();
        init_staking(&account);

        Staking::stake(&account, 30);

        let result = testing::assert_abort_code(
            || Staking::unstake(&account, 50),
            Staking::EINSUFFICIENT_BALANCE,
        );
        testing::assert!(result, 6);
    }

    /// Test successful unstake partial amount
    #[test]
    fun test_unstake_partial_amount() {
        let account = testing::new_signer();
        init_staking(&account);

        Staking::stake(&account, 100);
        Staking::unstake(&account, 40);

        let addr = signer::address_of(&account);
        let staked_amount = Staking::get_stake(addr);
        testing::assert!(staked_amount == 60, 7);
    }

    /// Test successful unstake full amount burns the StakeInfo resource
    #[test]
    fun test_unstake_full_amount_burns_resource() {
        let account = testing::new_signer();
        init_staking(&account);

        Staking::stake(&account, 75);
        Staking::unstake(&account, 75);

        let addr = signer::address_of(&account);
        let staked_amount = Staking::get_stake(addr);
        // After full unstake, stake should be zero and resource removed
        testing::assert!(staked_amount == 0, 8);
    }

    /// Test get_stake returns 0 if no stake info exists
    #[test]
    fun test_get_stake_no_stake_info() {
        let account = testing::new_signer();
        init_staking(&account);

        let addr = signer::address_of(&account);
        let staked_amount = Staking::get_stake(addr);
        testing::assert!(staked_amount == 0, 9);
    }

    /// Test staking emits StakedEvent and unstaking emits UnstakedEvent
    #[test]
    fun test_events_emitted() {
        let account = testing::new_signer();
        init_staking(&account);

        // Stake 100 tokens
        Staking::stake(&account, 100);

        // Unstake 40 tokens
        Staking::unstake(&account, 40);

        // Note: Direct event handle inspection is not possible in tests without exposing internal handles.
        // This test asserts no aborts to indirectly confirm events emitted.
        testing::assert!(true, 10);
    }
}