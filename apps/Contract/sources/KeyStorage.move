module 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::KeyStorage {
    use std::vector;
    use std::signer;

    /// Struct to store user's keys
    struct UserKeys has key {
        keys: vector<vector<u8>>,
    }

    /// Initialize storage for a user
    public entry fun init_storage(user: &signer) {
        move_to<UserKeys>(user, UserKeys { keys: vector::empty<vector<u8>>() });
    }

    /// Add a key for the user
    public entry fun add_key(user: &signer, key: vector<u8>) acquires UserKeys {
        let user_addr = signer::address_of(user);
        let user_keys_ref = borrow_global_mut<UserKeys>(user_addr);
        vector::push_back(&mut user_keys_ref.keys, key);
    }

    /// Get number of keys stored
    public fun key_count(user_addr: address): u64 acquires UserKeys {
        let user_keys_ref = borrow_global<UserKeys>(user_addr);
        vector::length(&user_keys_ref.keys)
    }
}
