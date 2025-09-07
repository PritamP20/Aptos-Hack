#[test_only]
module 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::KeyStorageTests {
    use std::vector;
    use std::signer;
    use 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::KeyStorage;

    #[test(user = @0x123)]
    public fun test_init_storage_success(user: signer) {
        let user_addr = signer::address_of(&user);
        
        // Initially should not have storage
        assert!(!KeyStorage::has_storage(user_addr), 1);
        
        // Initialize storage
        KeyStorage::init_storage(&user);
        
        // Now should have storage
        assert!(KeyStorage::has_storage(user_addr), 2);
        
        // Should have 0 keys initially
        assert!(KeyStorage::key_count(user_addr) == 0, 3);
    }

    #[test(user = @0x123)]
    #[expected_failure(abort_code = 1)] // E_STORAGE_NOT_INITIALIZED
    public fun test_init_storage_twice_fails(user: signer) {
        KeyStorage::init_storage(&user);
        // This should fail as storage already exists
        KeyStorage::init_storage(&user);
    }

    #[test(user = @0x123)]
    public fun test_add_key_success(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        let key1 = b"test_key_1";
        let key2 = b"test_key_2";
        
        // Add first key
        KeyStorage::add_key(&user, key1);
        assert!(KeyStorage::key_count(user_addr) == 1, 1);
        assert!(KeyStorage::has_key(user_addr, key1), 2);
        
        // Add second key
        KeyStorage::add_key(&user, key2);
        assert!(KeyStorage::key_count(user_addr) == 2, 3);
        assert!(KeyStorage::has_key(user_addr, key2), 4);
    }

    #[test(user = @0x123)]
    #[expected_failure(abort_code = 2)] // E_EMPTY_KEY
    public fun test_add_empty_key_fails(user: signer) {
        KeyStorage::init_storage(&user);
        let empty_key = vector::empty<u8>();
        KeyStorage::add_key(&user, empty_key);
    }

    #[test(user = @0x123)]
    #[expected_failure(abort_code = 1)] // E_STORAGE_NOT_INITIALIZED
    public fun test_add_key_without_init_fails(user: signer) {
        let key = b"test_key";
        KeyStorage::add_key(&user, key);
    }

    #[test(user = @0x123)]
    public fun test_get_key_success(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        let key1 = b"first_key";
        let key2 = b"second_key";
        
        KeyStorage::add_key(&user, key1);
        KeyStorage::add_key(&user, key2);
        
        // Test getting keys by index
        assert!(KeyStorage::get_key(user_addr, 0) == key1, 1);
        assert!(KeyStorage::get_key(user_addr, 1) == key2, 2);
    }

    #[test(user = @0x123)]
    #[expected_failure(abort_code = 3)] // E_INDEX_OUT_OF_BOUNDS
    public fun test_get_key_out_of_bounds_fails(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        let key = b"test_key";
        KeyStorage::add_key(&user, key);
        
        // Try to access index 1 when only index 0 exists
        KeyStorage::get_key(user_addr, 1);
    }

    #[test(user = @0x123)]
    #[expected_failure(abort_code = 1)] // E_STORAGE_NOT_INITIALIZED
    public fun test_get_key_without_init_fails(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::get_key(user_addr, 0);
    }

    #[test(user = @0x123)]
    public fun test_get_all_keys_success(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        let key1 = b"key_one";
        let key2 = b"key_two";
        let key3 = b"key_three";
        
        KeyStorage::add_key(&user, key1);
        KeyStorage::add_key(&user, key2);
        KeyStorage::add_key(&user, key3);
        
        let all_keys = KeyStorage::get_all_keys(user_addr);
        assert!(vector::length(&all_keys) == 3, 1);
        assert!(*vector::borrow(&all_keys, 0) == key1, 2);
        assert!(*vector::borrow(&all_keys, 1) == key2, 3);
        assert!(*vector::borrow(&all_keys, 2) == key3, 4);
    }

    #[test(user = @0x123)]
    public fun test_get_all_keys_empty(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        let all_keys = KeyStorage::get_all_keys(user_addr);
        assert!(vector::length(&all_keys) == 0, 1);
    }

    #[test(user = @0x123)]
    #[expected_failure(abort_code = 1)] // E_STORAGE_NOT_INITIALIZED
    public fun test_get_all_keys_without_init_fails(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::get_all_keys(user_addr);
    }

    #[test(user = @0x123)]
    public fun test_has_key_success(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        let key1 = b"existing_key";
        let key2 = b"non_existing_key";
        
        // Add only key1
        KeyStorage::add_key(&user, key1);
        
        // Test has_key
        assert!(KeyStorage::has_key(user_addr, key1), 1);
        assert!(!KeyStorage::has_key(user_addr, key2), 2);
    }

    #[test(user = @0x123)]
    public fun test_has_key_without_storage(user: signer) {
        let user_addr = signer::address_of(&user);
        let key = b"some_key";
        
        // Should return false when storage doesn't exist
        assert!(!KeyStorage::has_key(user_addr, key), 1);
    }

    #[test(user = @0x123)]
    #[expected_failure(abort_code = 1)] // E_STORAGE_NOT_INITIALIZED
    public fun test_key_count_without_init_fails(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::key_count(user_addr);
    }

    #[test(user = @0x123)]
    public fun test_has_storage_false(user: signer) {
        let user_addr = signer::address_of(&user);
        assert!(!KeyStorage::has_storage(user_addr), 1);
    }

    #[test(user = @0x123)]
    public fun test_duplicate_keys_allowed(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        let key = b"duplicate_key";
        
        // Add the same key twice
        KeyStorage::add_key(&user, key);
        KeyStorage::add_key(&user, key);
        
        // Should have 2 keys total
        assert!(KeyStorage::key_count(user_addr) == 2, 1);
        assert!(KeyStorage::has_key(user_addr, key), 2);
        
        // Both keys should be the same
        assert!(KeyStorage::get_key(user_addr, 0) == key, 3);
        assert!(KeyStorage::get_key(user_addr, 1) == key, 4);
    }

    #[test(user1 = @0x123, user2 = @0x456)]
    public fun test_multiple_users_isolated(user1: signer, user2: signer) {
        let user1_addr = signer::address_of(&user1);
        let user2_addr = signer::address_of(&user2);
        
        // Initialize storage for both users
        KeyStorage::init_storage(&user1);
        KeyStorage::init_storage(&user2);
        
        let key1 = b"user1_key";
        let key2 = b"user2_key";
        
        // Add different keys for each user
        KeyStorage::add_key(&user1, key1);
        KeyStorage::add_key(&user2, key2);
        
        // Each user should only have their own key
        assert!(KeyStorage::has_key(user1_addr, key1), 1);
        assert!(!KeyStorage::has_key(user1_addr, key2), 2);
        assert!(KeyStorage::has_key(user2_addr, key2), 3);
        assert!(!KeyStorage::has_key(user2_addr, key1), 4);
        
        // Each user should have exactly 1 key
        assert!(KeyStorage::key_count(user1_addr) == 1, 5);
        assert!(KeyStorage::key_count(user2_addr) == 1, 6);
    }

    #[test(user = @0x123)]
    public fun test_large_key_storage(user: signer) {
        let user_addr = signer::address_of(&user);
        KeyStorage::init_storage(&user);
        
        // Create a large key (256 bytes)
        let large_key = vector::empty<u8>();
        let i = 0;
        while (i < 256) {
            vector::push_back(&mut large_key, (i as u8));
            i = i + 1;
        };
        
        KeyStorage::add_key(&user, large_key);
        
        assert!(KeyStorage::key_count(user_addr) == 1, 1);
        assert!(KeyStorage::has_key(user_addr, large_key), 2);
        assert!(KeyStorage::get_key(user_addr, 0) == large_key, 3);
    }
}