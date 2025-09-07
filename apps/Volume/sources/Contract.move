module 0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27::staking {
    use std::signer;
    use std::string;
    use std::error;
    use std::event;
    use std::coin;
    use std::vector;
    use std::option;
    use aptos_framework::timestamp;

    /// Error codes
    const EALREADY_STAKED: u64 = 0;
    const ENOT_STAKED: u64 = 1;
    const EINSUFFICIENT_AMOUNT: u64 = 2;
    const EZERO_AMOUNT: u64 = 3;
    const ENOT_OWNER: u64 = 4;

    /// Staking configuration stored at module address
    struct Config has key {
        /// Minimum amount required to stake
        min_stake: u64,
        /// Reward rate in basis points (e.g., 500 = 5% per period)
        reward_basis_points: u64,
        /// Reward period in seconds
        reward_period_secs: u64,
    }

    /// Per-user staking resource
    struct Stake<CoinType> has key {
        amount: u64,
        last_stake_timestamp: u64,
        pending_reward: u64,
        phantom: phantom CoinType,
    }

    /// Event emitted when a user stakes
    struct StakedEvent<CoinType> has drop, store {
        staker: address,
        amount: u64,
        timestamp: u64,
        phantom: phantom CoinType,
    }

    /// Event emitted when a user unstakes
    struct UnstakedEvent<CoinType> has drop, store {
        staker: address,
        amount: u64,
        reward: u64,
        timestamp: u64,
        phantom: phantom CoinType,
    }

    /// Event handle storage for each user
    struct StakeEvents<CoinType> has key {
        staked_events: event::EventHandle<StakedEvent<CoinType>>,
        unstaked_events: event::EventHandle<UnstakedEvent<CoinType>>,
    }

    /// Initialize the staking config. Only the module owner may call.
    public entry fun init_config(
        admin: &signer,
        min_stake: u64,
        reward_basis_points: u64,
        reward_period_secs: u64
    ) acquires Config {
        let addr = signer::address_of(admin);
        assert!(addr == @0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27, error::permission_denied(ENOT_OWNER));
        assert!(!exists<Config>(addr), error::already_exists(EALREADY_STAKED));
        move_to(admin, Config {
            min_stake,
            reward_basis_points,
            reward_period_secs
        });
    }

    /// Initialize event handles for a user for a specific CoinType
    public entry fun init_events<CoinType>(user: &signer) acquires StakeEvents {
        let addr = signer::address_of(user);
        assert!(!exists<StakeEvents<CoinType>>(addr), error::already_exists(EALREADY_STAKED));
        move_to<StakeEvents<CoinType>>(user, StakeEvents<CoinType> {
            staked_events: event::new_event_handle<StakedEvent<CoinType>>(user),
            unstaked_events: event::new_event_handle<UnstakedEvent<CoinType>>(user)
        });
    }

    /// Stake a specific CoinType. User must have initialized their event handles.
    public entry fun stake<CoinType: store + key>(
        user: &signer,
        amount: u64
    ) acquires Stake<CoinType>, StakeEvents, Config {
        let user_addr = signer::address_of(user);
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));

        // Ensure config exists
        let config = borrow_global<Config>(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);

        assert!(amount >= config.min_stake, error::invalid_argument(EINSUFFICIENT_AMOUNT));

        assert!(!exists<Stake<CoinType>>(user_addr), error::already_exists(EALREADY_STAKED));

        // Transfer coins from user to the contract (held under module owner)
        let coins = coin::withdraw<CoinType>(user_addr, amount);
        coin::deposit<CoinType>(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27, coins);

        // Record stake resource
        let now = timestamp::now_seconds();
        move_to<Stake<CoinType>>(user, Stake<CoinType> {
            amount,
            last_stake_timestamp: now,
            pending_reward: 0,
            phantom: phantom<CoinType>,
        });

        // Emit event
        let events = borrow_global_mut<StakeEvents<CoinType>>(user_addr);
        event::emit(
            &mut events.staked_events,
            StakedEvent<CoinType> {
                staker: user_addr,
                amount,
                timestamp: now,
                phantom: phantom<CoinType>,
            }
        );
    }

    /// Unstake all tokens and claim rewards
    public entry fun unstake<CoinType: store + key>(
        user: &signer
    ) acquires Stake<CoinType>, StakeEvents, Config {
        let user_addr = signer::address_of(user);
        assert!(exists<Stake<CoinType>>(user_addr), error::not_found(ENOT_STAKED));

        let config = borrow_global<Config>(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);
        let now = timestamp::now_seconds();

        let stake_data = move_from<Stake<CoinType>>(user_addr);

        // Calculate rewards
        let duration = if now > stake_data.last_stake_timestamp { now - stake_data.last_stake_timestamp } else { 0 };
        let mut reward = 0u64;
        if duration > 0 {
            let periods = duration / config.reward_period_secs;
            reward = (stake_data.amount * config.reward_basis_points * periods) / 10000;
        }
        reward = reward + stake_data.pending_reward;

        // Send staked amount and reward back to user
        let total = stake_data.amount + reward;
        let coins = coin::withdraw<CoinType>(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27, total);
        coin::deposit<CoinType>(user_addr, coins);

        // Emit event
        let events = borrow_global_mut<StakeEvents<CoinType>>(user_addr);
        event::emit(
            &mut events.unstaked_events,
            UnstakedEvent<CoinType> {
                staker: user_addr,
                amount: stake_data.amount,
                reward,
                timestamp: now,
                phantom: phantom<CoinType>,
            }
        );
    }

    /// Claim rewards without unstaking
    public entry fun claim_rewards<CoinType: store + key>(
        user: &signer
    ) acquires Stake<CoinType>, Config {
        let user_addr = signer::address_of(user);
        assert!(exists<Stake<CoinType>>(user_addr), error::not_found(ENOT_STAKED));

        let config = borrow_global<Config>(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);
        let now = timestamp::now_seconds();

        let stake_ref = borrow_global_mut<Stake<CoinType>>(user_addr);

        let duration = if now > stake_ref.last_stake_timestamp { now - stake_ref.last_stake_timestamp } else { 0 };
        let mut reward = 0u64;
        if duration > 0 {
            let periods = duration / config.reward_period_secs;
            reward = (stake_ref.amount * config.reward_basis_points * periods) / 10000;
        }
        reward = reward + stake_ref.pending_reward;

        assert!(reward > 0, error::invalid_argument(EZERO_AMOUNT));

        // Transfer reward
        let coins = coin::withdraw<CoinType>(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27, reward);
        coin::deposit<CoinType>(user_addr, coins);

        stake_ref.last_stake_timestamp = now;
        stake_ref.pending_reward = 0;
    }

    /// View-only: get staking info for a user
    #[view]
    public fun get_stake<CoinType: store + key>(
        addr: address
    ): option::Option<(u64, u64, u64)> acquires Stake<CoinType> {
        if (exists<Stake<CoinType>>(addr)) {
            let s = borrow_global<Stake<CoinType>>(addr);
            option::some((s.amount, s.last_stake_timestamp, s.pending_reward))
        } else {
            option::none()
        }
    }

    /// View-only: get staking config
    #[view]
    public fun get_config(): (u64, u64, u64) acquires Config {
        let c = borrow_global<Config>(@0x30ed1b735e58ff52853fb862c0cded727f11c277e82aec24082e2ab63fe74c27);
        (c.min_stake, c.reward_basis_points, c.reward_period_secs)
    }
}