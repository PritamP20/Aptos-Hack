module 0x1::escrow_tests {
    use std::signer;
    use std::vector;
    use std::error;
    use std::option::Option;
    use 0x1::escrow;

    /// Helper function: create a new escrow and return the index (last in list)
    fun create_and_get_index(account: &signer, recipient: address, amount: u64): u64 {
        escrow::create_escrow(account, recipient, amount);
        escrow::get_escrow_count(account) - 1
    }

    #[test]
    fun test_init_escrows_and_create() {
        let sender = signer::spec_signer(0);
        let recipient = signer::address_of(&signer::spec_signer(1));
        // Init escrows
        escrow::init_escrows(&sender);
        let count = escrow::get_escrow_count(&sender);
        assert!(count == 0, 1);

        // Create escrow
        escrow::create_escrow(&sender, recipient, 100);
        let count = escrow::get_escrow_count(&sender);
        assert!(count == 1, 2);

        let escrow_info = escrow::get_escrow(&sender, 0);
        assert!(escrow_info.0 == signer::address_of(&sender), 3);
        assert!(escrow_info.1 == recipient, 4);
        assert!(escrow_info.2 == 100, 5);
        assert!(!escrow_info.3, 6); // funded false
        assert!(!escrow_info.4, 7); // released false
    }

    #[test]
    fun test_fund_escrow_success() {
        let sender = signer::spec_signer(10);
        let recipient = signer::address_of(&signer::spec_signer(11));
        let index = create_and_get_index(&sender, recipient, 50);

        escrow::fund_escrow(&sender, index);
        let escrow_info = escrow::get_escrow(&sender, index);
        assert!(escrow_info.3, 8); // funded true
        assert!(!escrow_info.4, 9); // released false
    }

    #[test]
    fun test_fund_escrow_already_funded_fail() {
        let sender = signer::spec_signer(20);
        let recipient = signer::address_of(&signer::spec_signer(21));
        let index = create_and_get_index(&sender, recipient, 75);

        escrow::fund_escrow(&sender, index);
        // Attempt to fund again must abort with ERR_ALREADY_FUNDED (2)
        let res = error::catch_abort_code(|| escrow::fund_escrow(&sender, index));
        assert!(res == escrow::ERR_ALREADY_FUNDED, 10);
    }

    #[test]
    fun test_fund_escrow_not_owner_fail() {
        let sender = signer::spec_signer(30);
        let recipient = signer::address_of(&signer::spec_signer(31));
        let index = create_and_get_index(&sender, recipient, 80);

        let other = signer::spec_signer(32);
        // Other account tries to fund escrow, should abort with ERR_NOT_ESCROW_OWNER (1)
        let res = error::catch_abort_code(|| escrow::fund_escrow(&other, index));
        assert!(res == escrow::ERR_NOT_ESCROW_OWNER, 11);
    }

    #[test]
    fun test_release_escrow_success() {
        let sender = signer::spec_signer(40);
        let recipient = signer::address_of(&signer::spec_signer(41));
        let index = create_and_get_index(&sender, recipient, 150);

        escrow::fund_escrow(&sender, index);
        escrow::release_escrow(&sender, signer::address_of(&sender), index);

        let escrow_info = escrow::get_escrow(&sender, index);
        assert!(escrow_info.4, 12); // released true
    }

    #[test]
    fun test_release_escrow_not_funded_fail() {
        let sender = signer::spec_signer(50);
        let recipient = signer::address_of(&signer::spec_signer(51));
        let index = create_and_get_index(&sender, recipient, 100);

        // Attempt release before funding should abort with ERR_NOT_FUNDED (3)
        let res = error::catch_abort_code(|| escrow::release_escrow(&sender, signer::address_of(&sender), index));
        assert!(res == escrow::ERR_NOT_FUNDED, 13);
    }

    #[test]
    fun test_release_escrow_not_owner_fail() {
        let sender = signer::spec_signer(60);
        let recipient = signer::address_of(&signer::spec_signer(61));
        let index = create_and_get_index(&sender, recipient, 100);
        escrow::fund_escrow(&sender, index);

        let other = signer::spec_signer(62);
        // Other account attempts to release - should abort with ERR_NOT_ESCROW_OWNER (1)
        let res = error::catch_abort_code(|| escrow::release_escrow(&other, signer::address_of(&sender), index));
        assert!(res == escrow::ERR_NOT_ESCROW_OWNER, 14);
    }

    #[test]
    fun test_cancel_escrow_success() {
        let sender = signer::spec_signer(70);
        let recipient = signer::address_of(&signer::spec_signer(71));
        let index = create_and_get_index(&sender, recipient, 200);

        // Cancel before funding
        escrow::cancel_escrow(&sender, index);
        let count = escrow::get_escrow_count(&sender);
        assert!(count == 0, 15);
    }

    #[test]
    fun test_cancel_escrow_funded_fail() {
        let sender = signer::spec_signer(80);
        let recipient = signer::address_of(&signer::spec_signer(81));
        let index = create_and_get_index(&sender, recipient, 300);
        escrow::fund_escrow(&sender, index);

        // Cancel after funding should abort with ERR_ALREADY_FUNDED (2)
        let res = error::catch_abort_code(|| escrow::cancel_escrow(&sender, index));
        assert!(res == escrow::ERR_ALREADY_FUNDED, 16);
    }

    #[test]
    fun test_cancel_escrow_not_owner_fail() {
        let sender = signer::spec_signer(90);
        let recipient = signer::address_of(&signer::spec_signer(91));
        let index = create_and_get_index(&sender, recipient, 400);

        let other = signer::spec_signer(92);
        // Other account attempts to cancel - abort ERR_NOT_ESCROW_OWNER (1)
        let res = error::catch_abort_code(|| escrow::cancel_escrow(&other, index));
        assert!(res == escrow::ERR_NOT_ESCROW_OWNER, 17);
    }

    #[test]
    fun test_get_escrow_invalid_index_fail() {
        let sender = signer::spec_signer(100);
        escrow::init_escrows(&sender);
        // No escrows created yet, index 0 invalid
        let res = error::catch_abort_code(|| escrow::get_escrow(&sender, 0));
        assert!(res == escrow::ERR_ESCROW_NOT_EXISTS, 18);
    }

    #[test]
    fun test_get_escrow_count_no_escrows() {
        let sender = signer::spec_signer(110);
        let count = escrow::get_escrow_count(&sender);
        assert!(count == 0, 19);
    }
}