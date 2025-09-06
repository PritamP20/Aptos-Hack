#[test_only]
module Contract::test {
    use std::signer;
    use std::vector;
    use aptos_std::account;
    use Contract::KeyStorage::{init_storage, add_key, key_count};

    #[test]
    fun test_add_and_count_keys() {
        // Create a test signer
        let signer = account::create_account_for_test(@0x1);

        // Initialize storage
        init_storage(&signer);

        // Two test keys
        let key1: vector<u8> = b"key_one";
        let key2: vector<u8> = b"key_two";

        // Add keys
        add_key(&signer, key1);
        add_key(&signer, key2);

        // Check key count
        let count = key_count(signer::address_of(&signer));
        assert!(count == 2, 42);
    }
}
