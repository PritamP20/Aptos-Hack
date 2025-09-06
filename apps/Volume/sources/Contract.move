module Staking {

    use std::signer;
    use std::vector;
    use std::error;
    use std::event;
    use std::timestamp;

    /// Error codes
    const EINSUFFICIENT_BALANCE: u64 = 1;
    const ENOT_STAKED: u64 = 2;
    const EZERO_AMOUNT: u64 = 3;
    const EALREADY_STAKED: u64 = 4;

    /// Event emitted when tokens are staked
    struct StakedEvent has copy, drop, store {
        staker: address,
        amount: u64,
        timestamp: u64,
    }

    /// Event emitted when tokens are unstaked
    struct UnstakedEvent has copy, drop, store {
        staker: address,
        amount: u64,
        timestamp: u64,
    }

    /// Resource to hold the staking state for a user
    struct StakeInfo has key {
        amount: u64,
        last_stake_time: u64,
    }

    /// Event handle resource for the module
    struct StakingEvents has key {
        staked_event_handle: event::EventHandle<StakedEvent>,
        unstaked_event_handle: event::EventHandle<UnstakedEvent>,
    }

    /// Initialize StakingEvents resource under the deployer account
    public fun init(account: &signer) {
        assert!(!exists<StakingEvents>(signer::address_of(account)), 0);
        move_to(account, StakingEvents {
            staked_event_handle: event::new_event_handle<StakedEvent>(account),
            unstaked_event_handle: event::new_event_handle<UnstakedEvent>(account),
        });
    }

    /// Stake tokens by specifying amount > 0
    /// For demo purposes, this contract does not handle token transfer,
    /// but assumes tokens are managed off-chain or via another module.
    public fun stake(account: &signer, amount: u64) {
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        let addr = signer::address_of(account);

        // Ensure user has a StakeInfo resource or create one
        if (!exists<StakeInfo>(addr)) {
            move_to(account, StakeInfo {
                amount,
                last_stake_time: timestamp::now_seconds(),
            });
        } else {
            let stake_info = borrow_global_mut<StakeInfo>(addr);
            stake_info.amount = stake_info.amount + amount;
            stake_info.last_stake_time = timestamp::now_seconds();
        }

        // Emit Staked event
        let events = borrow_global_mut<StakingEvents>(signer::address_of(account));
        event::emit_event(&mut events.staked_event_handle, StakedEvent {
            staker: addr,
            amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Unstake tokens by specifying amount > 0 and amount <= staked amount
    public fun unstake(account: &signer, amount: u64) {
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        let addr = signer::address_of(account);
        assert!(exists<StakeInfo>(addr), error::not_found(ENOT_STAKED));
        let stake_info = borrow_global_mut<StakeInfo>(addr);
        assert!(stake_info.amount >= amount, error::invalid_argument(EINSUFFICIENT_BALANCE));

        stake_info.amount = stake_info.amount - amount;
        stake_info.last_stake_time = timestamp::now_seconds();

        // If stake amount is zero, burn the resource
        if (stake_info.amount == 0) {
            move_from<StakeInfo>(addr);
        }

        // Emit Unstaked event
        let events = borrow_global_mut<StakingEvents>(signer::address_of(account));
        event::emit_event(&mut events.unstaked_event_handle, UnstakedEvent {
            staker: addr,
            amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Get the staked amount for an address
    public fun get_stake(addr: address): u64 acquires StakeInfo {
        if (!exists<StakeInfo>(addr)) {
            0
        } else {
            let stake_info = borrow_global<StakeInfo>(addr);
            stake_info.amount
        }
    }
}