// escrow_test.move
module 0x48bd1b77a08117f0a89a50314b84c22e1991d7feac0f1e8de90cede8b43ee151::escrow_test {
    use std::signer;
    use std::error;
    use std::coin;
    use std::string;
    use aptos_framework::timestamp;
    use 0x48bd1b77a08117f0a89a50314b84c22e1991d7feac0f1e8de90cede8b43ee151::escrow;

    /// Dummy coin for testing
    struct TestCoin has store, drop {}

    /// Mint coins for testing
    fun mint_for(account: &signer, amount: u64) {
        coin::register<TestCoin>(account);
        let coin_val = coin::mint<TestCoin>(amount);
        coin::deposit<TestCoin>(signer::address_of(account), coin_val);
    }

    #[test]
    public fun test_init_event_holder() {
        let account = @0x1;
        let s = signer::specify(account);
        escrow::init_event_holder(&s);
        assert!(exists<escrow::EscrowEventHolder>(account), 100);
    }

    #[test]
    public fun test_create_escrow_success() {
        let depositor_addr = @0x2;
        let beneficiary_addr = @0x3;
        let arbiter_addr = @0x4;
        let amount = 100;
        let depositor = signer::specify(depositor_addr);

        // Setup
        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        // Withdraw coins from depositor
        let coins = coin::withdraw<TestCoin>(depositor_addr, amount);

        escrow::create_escrow<TestCoin>(
            &depositor,
            beneficiary_addr,
            arbiter_addr,
            amount,
            coins
        );

        assert!(exists<escrow::Escrow<TestCoin>>(depositor_addr), 101);

        let (dep, ben, arb, amt, status, created_at) = escrow::get_escrow<TestCoin>(depositor_addr);
        assert!(dep == depositor_addr, 102);
        assert!(ben == beneficiary_addr, 103);
        assert!(arb == arbiter_addr, 104);
        assert!(amt == amount, 105);
        assert!(status == escrow::STATUS_PENDING, 106);
    }

    #[test]
    public fun test_create_escrow_zero_amount_should_fail() {
        let depositor_addr = @0x5;
        let beneficiary_addr = @0x6;
        let arbiter_addr = @0x7;
        let depositor = signer::specify(depositor_addr);

        mint_for(&depositor, 100);

        escrow::init_event_holder(&depositor);

        let coins = coin::withdraw<TestCoin>(depositor_addr, 100);

        // Should fail due to zero amount
        assert_abort_code(
            escrow::EAMOUNT_ZERO,
            fun () {
                escrow::create_escrow<TestCoin>(
                    &depositor,
                    beneficiary_addr,
                    arbiter_addr,
                    0,
                    coins
                );
            }
        );
    }

    #[test]
    public fun test_create_escrow_duplicate_should_fail() {
        let depositor_addr = @0x8;
        let beneficiary_addr = @0x9;
        let arbiter_addr = @0xa;
        let amount = 100;
        let depositor = signer::specify(depositor_addr);

        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        let coins1 = coin::withdraw<TestCoin>(depositor_addr, amount);
        escrow::create_escrow<TestCoin>(
            &depositor,
            beneficiary_addr,
            arbiter_addr,
            amount,
            coins1
        );

        // Try to create another escrow for same depositor
        let coins2 = coin::withdraw<TestCoin>(depositor_addr, amount);
        assert_abort_code(
            escrow::EESCROW_ALREADY_EXISTS,
            fun () {
                escrow::create_escrow<TestCoin>(
                    &depositor,
                    beneficiary_addr,
                    arbiter_addr,
                    amount,
                    coins2
                );
            }
        );
    }

    #[test]
    public fun test_release_success() {
        let depositor_addr = @0xb;
        let beneficiary_addr = @0xc;
        let arbiter_addr = @0xd;
        let amount = 200;
        let depositor = signer::specify(depositor_addr);
        let arbiter = signer::specify(arbiter_addr);

        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        let coins = coin::withdraw<TestCoin>(depositor_addr, amount);
        escrow::create_escrow<TestCoin>(&depositor, beneficiary_addr, arbiter_addr, amount, coins);

        // Release funds
        escrow::release<TestCoin>(&arbiter, depositor_addr);

        let (_, _, _, _, status, _) = escrow::get_escrow<TestCoin>(depositor_addr);
        assert!(status == escrow::STATUS_RELEASED, 201);
    }

    #[test]
    public fun test_release_not_arbiter_should_fail() {
        let depositor_addr = @0xe;
        let beneficiary_addr = @0xf;
        let arbiter_addr = @0x10;
        let wrong_arbiter_addr = @0x11;
        let amount = 300;

        let depositor = signer::specify(depositor_addr);
        let wrong_arbiter = signer::specify(wrong_arbiter_addr);

        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        let coins = coin::withdraw<TestCoin>(depositor_addr, amount);
        escrow::create_escrow<TestCoin>(&depositor, beneficiary_addr, arbiter_addr, amount, coins);

        assert_abort_code(
            escrow::ENOT_ARBITER,
            fun () {
                escrow::release<TestCoin>(&wrong_arbiter, depositor_addr);
            }
        );
    }

    #[test]
    public fun test_release_already_released_or_cancelled_should_fail() {
        let depositor_addr = @0x12;
        let beneficiary_addr = @0x13;
        let arbiter_addr = @0x14;
        let amount = 400;

        let depositor = signer::specify(depositor_addr);
        let arbiter = signer::specify(arbiter_addr);

        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        let coins = coin::withdraw<TestCoin>(depositor_addr, amount);
        escrow::create_escrow<TestCoin>(&depositor, beneficiary_addr, arbiter_addr, amount, coins);

        // Release
        escrow::release<TestCoin>(&arbiter, depositor_addr);

        // Try to release again
        assert_abort_code(
            escrow::EESCROW_NOT_PENDING,
            fun () {
                escrow::release<TestCoin>(&arbiter, depositor_addr);
            }
        );

        // Cancel should also fail after release
        assert_abort_code(
            escrow::EESCROW_NOT_PENDING,
            fun () {
                escrow::cancel<TestCoin>(&arbiter, depositor_addr);
            }
        );
    }

    #[test]
    public fun test_cancel_success() {
        let depositor_addr = @0x15;
        let beneficiary_addr = @0x16;
        let arbiter_addr = @0x17;
        let amount = 500;

        let depositor = signer::specify(depositor_addr);
        let arbiter = signer::specify(arbiter_addr);

        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        let coins = coin::withdraw<TestCoin>(depositor_addr, amount);
        escrow::create_escrow<TestCoin>(&depositor, beneficiary_addr, arbiter_addr, amount, coins);

        // Cancel escrow
        escrow::cancel<TestCoin>(&arbiter, depositor_addr);

        let (_, _, _, _, status, _) = escrow::get_escrow<TestCoin>(depositor_addr);
        assert!(status == escrow::STATUS_CANCELLED, 301);
    }

    #[test]
    public fun test_cancel_not_arbiter_should_fail() {
        let depositor_addr = @0x18;
        let beneficiary_addr = @0x19;
        let arbiter_addr = @0x1a;
        let wrong_arbiter_addr = @0x1b;
        let amount = 600;

        let depositor = signer::specify(depositor_addr);
        let wrong_arbiter = signer::specify(wrong_arbiter_addr);

        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        let coins = coin::withdraw<TestCoin>(depositor_addr, amount);
        escrow::create_escrow<TestCoin>(&depositor, beneficiary_addr, arbiter_addr, amount, coins);

        assert_abort_code(
            escrow::ENOT_ARBITER,
            fun () {
                escrow::cancel<TestCoin>(&wrong_arbiter, depositor_addr);
            }
        );
    }

    #[test]
    public fun test_get_escrow_not_found_should_fail() {
        let not_exist_addr = @0x20;
        assert_abort_code(
            escrow::EESCROW_NOT_FOUND,
            fun () {
                escrow::get_escrow<TestCoin>(not_exist_addr);
            }
        );
    }

    #[test]
    public fun test_events_emitted_on_create_release_cancel() {
        let depositor_addr = @0x21;
        let beneficiary_addr = @0x22;
        let arbiter_addr = @0x23;
        let amount = 700;

        let depositor = signer::specify(depositor_addr);
        let arbiter = signer::specify(arbiter_addr);

        mint_for(&depositor, amount);

        escrow::init_event_holder(&depositor);

        let coins = coin::withdraw<TestCoin>(depositor_addr, amount);

        // Create
        escrow::create_escrow<TestCoin>(&depositor, beneficiary_addr, arbiter_addr, amount, coins);

        let holder = borrow_global<escrow::EscrowEventHolder>(depositor_addr);
        assert!(event::count(&holder.created_events) == 1, 401);

        // Release
        escrow::release<TestCoin>(&arbiter, depositor_addr);
        assert!(event::count(&holder.released_events) == 1, 402);

        // No cancelled yet
        assert!(event::count(&holder.cancelled_events) == 0, 403);
    }
}