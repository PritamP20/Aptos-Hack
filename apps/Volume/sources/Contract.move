module 0x48bd1b77a08117f0a89a50314b84c22e1991d7feac0f1e8de90cede8b43ee151::escrow {
    use std::signer;
    use std::address;
    use std::error;
    use std::event;
    use std::coin;
    use std::string;
    use aptos_framework::timestamp;

    /// Error codes
    const ENOT_DEPOSITOR: u64 = 0;
    const ENOT_ARBITER: u64 = 1;
    const ENOT_BENEFICIARY: u64 = 2;
    const EESCROW_NOT_FOUND: u64 = 3;
    const EESCROW_ALREADY_EXISTS: u64 = 4;
    const EESCROW_NOT_PENDING: u64 = 5;
    const EAMOUNT_ZERO: u64 = 6;

    /// Escrow status
    const STATUS_PENDING: u8 = 0;
    const STATUS_RELEASED: u8 = 1;
    const STATUS_CANCELLED: u8 = 2;

    /// Escrow resource
    struct Escrow<CoinType> has key, store {
        depositor: address,
        beneficiary: address,
        arbiter: address,
        amount: u64,
        status: u8,
        created_at: u64,
        coin: coin::Coin<CoinType>,
    }

    /// Event emitted when an escrow is created
    #[event]
    struct EscrowCreatedEvent has drop, store {
        escrow_id: address,
        depositor: address,
        beneficiary: address,
        arbiter: address,
        amount: u64,
        timestamp: u64,
    }

    /// Event emitted when funds are released
    #[event]
    struct ReleasedEvent has drop, store {
        escrow_id: address,
        released_to: address,
        amount: u64,
        timestamp: u64,
    }

    /// Event emitted when funds are cancelled/refunded
    #[event]
    struct CancelledEvent has drop, store {
        escrow_id: address,
        refunded_to: address,
        amount: u64,
        timestamp: u64,
    }

    /// Resource to hold events
    struct EscrowEventHolder has key {
        created_events: event::EventHandle<EscrowCreatedEvent>,
        released_events: event::EventHandle<ReleasedEvent>,
        cancelled_events: event::EventHandle<CancelledEvent>,
    }

    /// Initialize event storage for the account
    public entry fun init_event_holder(account: &signer) {
        let addr = signer::address_of(account);
        assert!(
            !exists<EscrowEventHolder>(addr),
            error::already_exists(EESCROW_ALREADY_EXISTS)
        );
        move_to(account, EscrowEventHolder {
            created_events: event::new_event_handle<EscrowCreatedEvent>(account),
            released_events: event::new_event_handle<ReleasedEvent>(account),
            cancelled_events: event::new_event_handle<CancelledEvent>(account),
        });
    }

    /// Create a new escrow. The depositor must be the signer sending the coins.
    public entry fun create_escrow<CoinType>(
        depositor: &signer,
        beneficiary: address,
        arbiter: address,
        amount: u64,
        coin: coin::Coin<CoinType>
    ) acquires EscrowEventHolder {
        let depositor_addr = signer::address_of(depositor);
        assert!(amount > 0, error::invalid_argument(EAMOUNT_ZERO));
        assert!(!exists<Escrow<CoinType>>(depositor_addr), error::already_exists(EESCROW_ALREADY_EXISTS));
        let now = timestamp::now_seconds();

        move_to<Escrow<CoinType>>(depositor, Escrow {
            depositor: depositor_addr,
            beneficiary,
            arbiter,
            amount,
            status: STATUS_PENDING,
            created_at: now,
            coin,
        });

        if (exists<EscrowEventHolder>(depositor_addr)) {
            let holder = borrow_global_mut<EscrowEventHolder>(depositor_addr);
            event::emit(&mut holder.created_events, EscrowCreatedEvent {
                escrow_id: depositor_addr,
                depositor: depositor_addr,
                beneficiary,
                arbiter,
                amount,
                timestamp: now,
            });
        }
    }

    /// Release funds to beneficiary. Only the arbiter can call this.
    public entry fun release<CoinType>(
        arbiter: &signer,
        escrow_addr: address
    ) acquires Escrow<CoinType>, EscrowEventHolder {
        let arbiter_addr = signer::address_of(arbiter);
        assert!(exists<Escrow<CoinType>>(escrow_addr), error::not_found(EESCROW_NOT_FOUND));
        let escrow = borrow_global_mut<Escrow<CoinType>>(escrow_addr);
        assert!(escrow.status == STATUS_PENDING, error::invalid_state(EESCROW_NOT_PENDING));
        assert!(escrow.arbiter == arbiter_addr, error::permission_denied(ENOT_ARBITER));

        let beneficiary = escrow.beneficiary;
        let amount = escrow.amount;
        let now = timestamp::now_seconds();
        let coin = coin::withdraw<CoinType>(escrow_addr, amount);
        coin::deposit<CoinType>(beneficiary, coin);

        escrow.status = STATUS_RELEASED;

        if (exists<EscrowEventHolder>(escrow_addr)) {
            let holder = borrow_global_mut<EscrowEventHolder>(escrow_addr);
            event::emit(&mut holder.released_events, ReleasedEvent {
                escrow_id: escrow_addr,
                released_to: beneficiary,
                amount,
                timestamp: now,
            });
        }
    }

    /// Cancel escrow and refund to depositor. Only the arbiter can call this.
    public entry fun cancel<CoinType>(
        arbiter: &signer,
        escrow_addr: address
    ) acquires Escrow<CoinType>, EscrowEventHolder {
        let arbiter_addr = signer::address_of(arbiter);
        assert!(exists<Escrow<CoinType>>(escrow_addr), error::not_found(EESCROW_NOT_FOUND));
        let escrow = borrow_global_mut<Escrow<CoinType>>(escrow_addr);
        assert!(escrow.status == STATUS_PENDING, error::invalid_state(EESCROW_NOT_PENDING));
        assert!(escrow.arbiter == arbiter_addr, error::permission_denied(ENOT_ARBITER));

        let depositor = escrow.depositor;
        let amount = escrow.amount;
        let now = timestamp::now_seconds();
        let coin = coin::withdraw<CoinType>(escrow_addr, amount);
        coin::deposit<CoinType>(depositor, coin);

        escrow.status = STATUS_CANCELLED;

        if (exists<EscrowEventHolder>(escrow_addr)) {
            let holder = borrow_global_mut<EscrowEventHolder>(escrow_addr);
            event::emit(&mut holder.cancelled_events, CancelledEvent {
                escrow_id: escrow_addr,
                refunded_to: depositor,
                amount,
                timestamp: now,
            });
        }
    }

    /// View escrow status and details
    #[view]
    public fun get_escrow<CoinType>(escrow_addr: address): (address, address, address, u64, u8, u64)
        acquires Escrow<CoinType>
    {
        assert!(exists<Escrow<CoinType>>(escrow_addr), error::not_found(EESCROW_NOT_FOUND));
        let escrow = borrow_global<Escrow<CoinType>>(escrow_addr);
        (
            escrow.depositor,
            escrow.beneficiary,
            escrow.arbiter,
            escrow.amount,
            escrow.status,
            escrow.created_at
        )
    }
}