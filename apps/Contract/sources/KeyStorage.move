module 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::KeyStorage {
    use std::vector;
    use std::signer;

    /// Error codes
    const E_STORAGE_NOT_INITIALIZED: u64 = 1;
    const E_EMPTY_KEY: u64 = 2;
    const E_INDEX_OUT_OF_BOUNDS: u64 = 3;

    struct UserKeys has key {
        keys: vector<vector<u8>>,
    }

    /// Initialize storage for a user
    public entry fun init_storage(user: &signer) {
        let user_addr = signer::address_of(user);
        assert!(!exists<UserKeys>(user_addr), E_STORAGE_NOT_INITIALIZED);
        move_to<UserKeys>(user, UserKeys { keys: vector::empty<vector<u8>>() });
    }

    /// Add a key to user's storage
    public entry fun add_key(user: &signer, key: vector<u8>) acquires UserKeys {
        assert!(vector::length(&key) > 0, E_EMPTY_KEY);
        let user_addr = signer::address_of(user);
        assert!(exists<UserKeys>(user_addr), E_STORAGE_NOT_INITIALIZED);
        let user_keys_ref = borrow_global_mut<UserKeys>(user_addr);
        vector::push_back(&mut user_keys_ref.keys, key);
    }

    /// Get the number of keys stored for a user (VIEW FUNCTION)
    #[view]
    public fun key_count(user_addr: address): u64 acquires UserKeys {
        assert!(exists<UserKeys>(user_addr), E_STORAGE_NOT_INITIALIZED);
        let user_keys_ref = borrow_global<UserKeys>(user_addr);
        vector::length(&user_keys_ref.keys)
    }

    /// Check if a user has initialized storage (VIEW FUNCTION)
    #[view]
    public fun has_storage(user_addr: address): bool {
        exists<UserKeys>(user_addr)
    }

    /// Get a specific key by index (VIEW FUNCTION)
    #[view]
    public fun get_key(user_addr: address, index: u64): vector<u8> acquires UserKeys {
        assert!(exists<UserKeys>(user_addr), E_STORAGE_NOT_INITIALIZED);
        let user_keys_ref = borrow_global<UserKeys>(user_addr);
        assert!(index < vector::length(&user_keys_ref.keys), E_INDEX_OUT_OF_BOUNDS);
        *vector::borrow(&user_keys_ref.keys, index)
    }

    /// Get all keys for a user (VIEW FUNCTION)
    #[view]
    public fun get_all_keys(user_addr: address): vector<vector<u8>> acquires UserKeys {
        assert!(exists<UserKeys>(user_addr), E_STORAGE_NOT_INITIALIZED);
        let user_keys_ref = borrow_global<UserKeys>(user_addr);
        *&user_keys_ref.keys
    }

    /// Check if a specific key exists (VIEW FUNCTION)
    #[view]
    public fun has_key(user_addr: address, key: vector<u8>): bool acquires UserKeys {
        if (!exists<UserKeys>(user_addr)) {
            return false
        };
        let user_keys_ref = borrow_global<UserKeys>(user_addr);
        vector::contains(&user_keys_ref.keys, &key)
    }
}