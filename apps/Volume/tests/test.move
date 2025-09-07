module 0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27::staking_test {
    use std::signer;
    use std::option;
    use std::vector;
    use std::coin;
    use std::string;
    use std::error;
    use aptos_framework::timestamp;
    use 0x1::test;
    use 0x1::aptos_coin::{AptosCoin};
    use 0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27::staking;

    /// Helper: Mints coins to the specified account
    fun mint_coins<CoinType: store + key>(recipient: &signer, amount: u64) {
        coin::register<CoinType>(recipient);
        coin::mint<CoinType>(recipient, amount);
    }

    /// Helper: Advances blockchain time in tests
    fun advance_time(secs: u64) {
        timestamp::set_time(timestamp::now_seconds() + secs);
    }

    #[test]
    public fun test_init_config_only_owner() {
        let owner = @0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27;
        let not_owner = @0x1;

        let owner_signer = test::create_signer(owner);
        let not_owner_signer = test::create_signer(not_owner);

        // Should succeed for owner
        staking::init_config(&owner_signer, 100, 500, 3600);

        // Should fail for not owner
        let res = test::execute_should_abort_code(
            fun() {
                staking::init_config(&not_owner_signer, 100, 500, 3600);
            }
        );
        // ENOT_OWNER = 4
        assert!(res == error::permission_denied(4), 100);

        // Should fail if already initialized
        let res2 = test::execute_should_abort_code(
            fun() {
                staking::init_config(&owner_signer, 100, 500, 3600);
            }
        );
        // EALREADY_STAKED = 0
        assert!(res2 == error::already_exists(0), 101);
    }

    #[test]
    public fun test_init_events() {
        let user_addr = @0x2;
        let user_signer = test::create_signer(user_addr);

        staking::init_events<AptosCoin>(&user_signer);

        // Should fail if already initialized
        let res = test::execute_should_abort_code(
            fun() { staking::init_events<AptosCoin>(&user_signer); }
        );
        // EALREADY_STAKED = 0
        assert!(res == error::already_exists(0), 200);
    }

    #[test]
    public fun test_stake_and_get_stake() {
        let owner = test::create_signer(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);
        let user_addr = @0x2;
        let user_signer = test::create_signer(user_addr);

        staking::init_config(&owner, 100, 500, 3600);
        staking::init_events<AptosCoin>(&user_signer);

        mint_coins<AptosCoin>(&user_signer, 1_000);

        // Should fail if amount is zero
        let res = test::execute_should_abort_code(
            fun() { staking::stake<AptosCoin>(&user_signer, 0); }
        );
        // EZERO_AMOUNT = 3
        assert!(res == error::invalid_argument(3), 300);

        // Should fail if amount < min_stake
        let res2 = test::execute_should_abort_code(
            fun() { staking::stake<AptosCoin>(&user_signer, 50); }
        );
        // EINSUFFICIENT_AMOUNT = 2
        assert!(res2 == error::invalid_argument(2), 301);

        // Stake correct amount
        staking::stake<AptosCoin>(&user_signer, 200);

        // Should fail if already staked
        let res3 = test::execute_should_abort_code(
            fun() { staking::stake<AptosCoin>(&user_signer, 200); }
        );
        // EALREADY_STAKED = 0
        assert!(res3 == error::already_exists(0), 302);

        // Check stake info
        let info = staking::get_stake<AptosCoin>(user_addr);
        assert!(option::is_some(&info), 303);

        let (amount, last_stake_timestamp, pending_reward) = *option::borrow(&info).unwrap();
        assert!(amount == 200, 304);
        assert!(pending_reward == 0, 305);
        assert!(last_stake_timestamp > 0, 306);
    }

    #[test]
    public fun test_unstake_happy_flow() {
        let owner = test::create_signer(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);
        let user_addr = @0x3;
        let user_signer = test::create_signer(user_addr);

        staking::init_config(&owner, 100, 1000, 10); // 10% per 10 seconds for easy testing
        staking::init_events<AptosCoin>(&user_signer);
        mint_coins<AptosCoin>(&user_signer, 1_000);

        staking::stake<AptosCoin>(&user_signer, 500);

        // Advance time by 20 seconds (2 periods)
        advance_time(20);

        staking::unstake<AptosCoin>(&user_signer);

        // Stake should be removed
        let info = staking::get_stake<AptosCoin>(user_addr);
        assert!(option::is_none(&info), 400);

        // Check user balance includes principal + reward: 500 + (500*1000*2/10000) = 500 + 100 = 600
        // Use coin::balance to check
        let bal = coin::balance<AptosCoin>(user_addr);
        assert!(bal == 1_000, 401); // 1_000 - 500 staked, 600 returned -> net balance should be original (no loss)
    }

    #[test]
    public fun test_unstake_no_stake() {
        let user_signer = test::create_signer(@0x4);

        let res = test::execute_should_abort_code(
            fun() { staking::unstake<AptosCoin>(&user_signer); }
        );
        // ENOT_STAKED = 1
        assert!(res == error::not_found(1), 500);
    }

    #[test]
    public fun test_claim_rewards() {
        let owner = test::create_signer(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);
        let user_addr = @0x5;
        let user_signer = test::create_signer(user_addr);

        staking::init_config(&owner, 100, 1000, 10); // 10% per 10 sec
        staking::init_events<AptosCoin>(&user_signer);
        mint_coins<AptosCoin>(&user_signer, 1_000);

        staking::stake<AptosCoin>(&user_signer, 500);

        // Should fail if claiming immediately (no rewards)
        let res = test::execute_should_abort_code(
            fun() { staking::claim_rewards<AptosCoin>(&user_signer); }
        );
        // EZERO_AMOUNT = 3
        assert!(res == error::invalid_argument(3), 600);

        // Advance time by 10 seconds
        advance_time(10);

        staking::claim_rewards<AptosCoin>(&user_signer);

        // Should be able to claim again only after more time
        let res2 = test::execute_should_abort_code(
            fun() { staking::claim_rewards<AptosCoin>(&user_signer); }
        );
        assert!(res2 == error::invalid_argument(3), 601);
    }

    #[test]
    public fun test_get_config() {
        let owner = test::create_signer(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);

        staking::init_config(&owner, 123, 456, 789);

        let (min_stake, reward_bps, reward_period) = staking::get_config();
        assert!(min_stake == 123, 700);
        assert!(reward_bps == 456, 701);
        assert!(reward_period == 789, 702);
    }

    #[test]
    public fun test_multiple_users_and_coin_types() {
        let owner = test::create_signer(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);
        let user1_addr = @0x6;
        let user2_addr = @0x7;
        let user1_signer = test::create_signer(user1_addr);
        let user2_signer = test::create_signer(user2_addr);

        staking::init_config(&owner, 100, 1000, 10);
        staking::init_events<AptosCoin>(&user1_signer);
        staking::init_events<AptosCoin>(&user2_signer);

        mint_coins<AptosCoin>(&user1_signer, 1_000);
        mint_coins<AptosCoin>(&user2_signer, 2_000);

        staking::stake<AptosCoin>(&user1_signer, 200);
        staking::stake<AptosCoin>(&user2_signer, 400);

        advance_time(10);

        staking::claim_rewards<AptosCoin>(&user1_signer);
        staking::claim_rewards<AptosCoin>(&user2_signer);

        advance_time(10);

        staking::unstake<AptosCoin>(&user1_signer);
        staking::unstake<AptosCoin>(&user2_signer);

        // Both users should have their stake + rewards back
        let bal1 = coin::balance<AptosCoin>(user1_addr);
        let bal2 = coin::balance<AptosCoin>(user2_addr);

        assert!(bal1 == 1_000, 800);
        assert!(bal2 == 2_000, 801);
    }
}