module HelloWorld {
    /// Event emitted when greeting is set
    struct Greeting has copy, drop, store {
        message: vector<u8>,
    }

    /// Resource to hold the greeting state
    struct GreetingHolder has key {
        greeting: vector<u8>,
    }

    /// Initialize the GreetingHolder resource under the signer's account
    public entry fun init(account: &signer) {
        // Ensure the resource does not already exist
        assert!(!exists<GreetingHolder>(signer::address_of(account)), 1);

        let hello = b"Hello, World!";
        move_to(account, GreetingHolder { greeting: vector::from_bytes(hello) });
    }

    /// Public function to get the current greeting message
    public fun get_greeting(account: &signer): vector<u8> acquires GreetingHolder {
        let holder = borrow_global<GreetingHolder>(signer::address_of(account));
        holder.greeting.clone()
    }

    /// Public entry function to update the greeting message
    public entry fun set_greeting(account: &signer, new_message: vector<u8>) acquires GreetingHolder {
        let holder = borrow_global_mut<GreetingHolder>(signer::address_of(account));
        holder.greeting = new_message;
    }
}