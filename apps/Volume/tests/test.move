module HelloWorldTests {
    use std::vector;
    use std::string;
    use std::signer;
    use HelloWorld;

    /// Helper function to convert vector<u8> to string for assertion messages
    fun vector_to_string(v: vector<u8>): string::String {
        string::utf8(v)
    }

    #[test_only]
    public fun test_init_and_get_greeting(account: &signer) {
        // Initialize the GreetingHolder resource
        HelloWorld::init(account);

        // Retrieve the greeting
        let greeting = HelloWorld::get_greeting(account);

        // Expected greeting bytes for "Hello, World!"
        let expected = vector::from_bytes(b"Hello, World!");

        // Assert the greeting matches the initialized message
        assert!(greeting == expected, 100, vector_to_string(greeting));
    }

    #[test_only]
    public fun test_set_greeting(account: &signer) {
        // Initialize first
        HelloWorld::init(account);

        // New greeting message
        let new_message = vector::from_bytes(b"Hi there!");

        // Set the new greeting
        HelloWorld::set_greeting(account, new_message.clone());

        // Retrieve updated greeting
        let updated_greeting = HelloWorld::get_greeting(account);

        // Assert updated greeting matches the new message
        assert!(updated_greeting == new_message, 101, vector_to_string(updated_greeting));
    }

    #[test_only]
    public fun test_init_fails_if_already_initialized(account: &signer) {
        // Initialize once
        HelloWorld::init(account);

        // Attempting to initialize again should abort with code 1
        // Since Move testing framework does not have direct try-catch,
        // we simulate by expecting abort on second init call
        let res = aborts_with(
            || { HelloWorld::init(account); },
            1
        );

        assert!(res, 102);
    }

    /// Helper function to test abort code for a function call
    native fun aborts_with(f: &fun(), code: u64): bool;

}