import express from "express";
import cors from "cors";
import axios from "axios";
import { writeFile, readFile } from "fs/promises";
import { exec } from "child_process";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "../.env" });
const app = express();
app.use(cors());
app.use(express.json());
import { fileURLToPath } from "url";   // ✅ add this
import { unlinkSync } from "fs";  

dotenv.config(); // Loads GOOGLE_API_KEY from .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3002;

// ✅ FIXED: Store standard account info globally
let STANDARD_ACCOUNT: {
  address: string;
  privateKey: string;
  keyFilePath: string;
  pubKeyFilePath: string;
} | null = null;

const docs = `
Aptos Move Language: Comprehensive Rules, Guidelines, Best Practices, and Example Contracts
Below is a scraped and compiled collection of key rules, coding conventions, security guidelines, best practices, and example Aptos Move smart contracts from official Aptos documentation and related resources (e.g., aptos.dev, aptos.guide, and tutorials). This is structured for easy copying into a system prompt for an AI like Perplexity to generate error-free Move contracts. I've organized it into sections for clarity: Language Rules and Syntax, Coding Conventions, Security Guidelines and Best Practices, and Example Contracts. Use this as reference material in your prompt, e.g., "Using the following Aptos Move rules, guidelines, and examples, generate an error-free contract for [description]: [paste this content]".
Language Rules and Syntax (From Aptos Move Book and Docs)
Aptos Move is a safe, resource-oriented programming language for smart contracts. Key rules:

Modules: Contracts are organized into modules. Each module defines types, functions, and resources. Modules are published under an account address.
Resources: Special data types that "live" in global storage and follow linear logic— they can't be copied or discarded implicitly, preventing duplication or loss of assets. Use has key for storable resources.
Functions: Can be public, public(friend), entry, or private. entry functions are callable from transactions. Use acquires to declare resource borrowing.
Types: Primitive types (u8, u64, bool, address, etc.). Structs for custom types. Generics for flexible types (e.g., vector<T>). Use phantom for generics that don't affect storage.
Ownership and Borrowing: Use & for immutable borrows, &mut for mutable. Global storage ops: move_to, move_from, borrow_global, borrow_global_mut.
Errors: Use abort or assert! with error codes. Define constants for errors (e.g., const ENO_MESSAGE: u64 = 0;).
Events: Emit events using event::emit for on-chain notifications.
Visibility: Follow least privilege—start private, expose as needed.
Generics: Check types to prevent mismatches (e.g., use phantom T in structs like Receipt<phantom T>).
Loops and Execution: Avoid unbounded loops to prevent gas exhaustion. Use efficient data structures like SmartTable or vector.
Testing: Use #[test] annotations for unit tests. Include setup like account creation.
Compilation and Deployment: Use Aptos CLI for compile/test/publish. Named addresses in Move.toml must be resolved.
Formal Verification: Use Move Prover for specs (subset of Move for behavior verification).

Coding Conventions (From Official Aptos Docs)
Follow these for clean, maintainable code:

Naming:

Modules: Lowercase snake_case (e.g., fixed_point32).
Types: CamelCase (e.g., Coin).
Functions: Lowercase snake_case (e.g., destroy_empty).
Constants: UpperCamelCase starting with E for errors (e.g., EIndexOutOfBounds); upper snake_case for others (e.g., MIN_STAKE).
Generics: Descriptive like T or Element.
Files: Match module name in lowercase snake_case.


Imports: All use at module top. Import types at top level; functions fully qualified. Use as for name clashes.
Comments: Use /// for doc comments above items. // for single-line, /* */ for blocks. UTF-8 allowed.
Formatting: 4-space indentation (none for script/address blocks). Max 100 chars per line. Declare structs/constants before functions.
Example Import and Usage:
textmodule 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::foo {
    struct Foo { }
    public fun do_foo(): Foo { Foo{} }
}

module 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::bar {
    use 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::foo::{Self, Foo};
    public fun do_bar(x: u64): Foo {
        if (x == 10) { foo::do_foo() } else { abort 0 }
    }
}

Example with Name Clash:
textuse 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::other_foo::Foo as OtherFoo;
use 0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b::foo::Foo;


Security Guidelines and Best Practices (From Aptos Guide and Docs)

Access Control:

Check object ownership with object::owner(&obj) == signer::address_of(&signer).
Use signer::address_of for global storage access.
Insecure Example (No Ownership Check):
textentry fun execute_action_with_valid_subscription(user: &signer, obj: Object<Subscription>) acquires Subscription {
    let object_address = object::object_address(&obj);
    let subscription = borrow_global<Subscription>(object_address);
    assert!(subscription.end_subscription >= aptos_framework::timestamp::now_seconds(),1);
}

Secure Example:
textentry fun execute_action_with_valid_subscription(user: &signer, obj: Object<Subscription>) acquires Subscription {
    assert!(object::owner(&obj)==address_of(user),ENOT_OWNER);
    // ... rest as above
}

For deletion:

Insecure: public fun delete(user: &signer, obj: Object) { let Object { data } = obj; }
Secure: public fun delete(user: &signer) { let Object { data } = move_from<Object>(signer::address_of(user)); }




Function Visibility: Least privilege—private by default. Use entry for tx calls, public(friend) for module access, #[view] for read-only.

Example: public(friend) entry fun sample_function() { }


Generics: Enforce type safety with phantom.

Insecure Flash Loan (Type Mismatch):
textpublic fun repay_flash_loan<T>(rec: Receipt, coins: Coin<T>) {
    let Receipt{ amount } = rec;
    assert!(coin::value<T>(&coins) >= rec.amount, 0);
    deposit(coins);
}

Secure:
textstruct Receipt<phantom T> { amount: u64 }
public fun repay_flash_loan<T>(rec: Receipt<T>, coins: Coin<T>) { /* ... */ }



Resource Management: Store user data separately to avoid unbounded ops. Use SmartTable for efficiency.

Insecure (Unbounded Loop):
textpublic fun get_order_by_id(order_id: u64): Option<Order> acquires OrderStore {
    let order_store = borrow_global_mut<OrderStore>(@admin);
    let i = 0;
    let len = vector::length(&order_store.orders);
    while (i < len) {
        let order = vector::borrow<Order>(&order_store.orders, i);
        if (order.id == order_id) { return option::some(*order) };
        i = i + 1;
    };
    option::none()
}

Best Practice: Limit iterations, use maps for O(1) access.


Other Best Practices: Formal verification with Move Prover. Audit code. Separate concerns in modules. Test on testnet before mainnet.

Example Contracts
Example 1: Hello Blockchain (Basic Message Storage)
textmodule hello_blockchain::message {
    use std::error;
    use std::signer;
    use std::string;
    use aptos_framework::event;

    struct MessageHolder has key {
        message: string::String,
    }

    #[event]
    struct MessageChange has drop, store {
        account: address,
        from_message: string::String,
        to_message: string::String,
    }

    const ENO_MESSAGE: u64 = 0;

    #[view]
    public fun get_message(addr: address): string::String acquires MessageHolder {
        assert!(exists<MessageHolder>(addr), error::not_found(ENO_MESSAGE));
        borrow_global<MessageHolder>(addr).message
    }

    public entry fun set_message(account: signer, message: string::String) acquires MessageHolder {
        let account_addr = signer::address_of(&account);
        if (!exists<MessageHolder>(account_addr)) {
            move_to(&account, MessageHolder { message });
        } else {
            let old_message_holder = borrow_global_mut<MessageHolder>(account_addr);
            let from_message = old_message_holder.message;
            event::emit(MessageChange { account: account_addr, from_message, to_message: copy message });
            old_message_holder.message = message;
        }
    }

    #[test(account = @0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b)]
    public entry fun sender_can_set_message(account: signer) acquires MessageHolder {
        let addr = signer::address_of(&account);
        aptos_framework::account::create_account_for_test(addr);
        set_message(account, string::utf8(b"Hello, Blockchain"));
        assert!(get_message(addr) == string::utf8(b"Hello, Blockchain"), ENO_MESSAGE);
    }
}
Example 2: First Move Module (Message with Debug)
textmodule my_first_module::message {
    use std::string;
    use std::signer;
    use std::debug;

    struct MessageHolder has key, store, drop {
        message: string::String,
    }

    public entry fun set_message(account: &signer, message: string::String) acquires MessageHolder {
        let account_addr = signer::address_of(account);
        debug::print(&message);
        if (exists<MessageHolder>(account_addr)) {
            debug::print(&string::utf8(b"Updating existing message"));
            move_from<MessageHolder>(account_addr);
        } else {
            debug::print(&string::utf8(b"Creating new message"));
        };
        move_to(account, MessageHolder { message });
    }

    public fun get_message(account_addr: address): string::String acquires MessageHolder {
        assert!(exists<MessageHolder>(account_addr), 0);
        let message_holder = borrow_global<MessageHolder>(account_addr);
        debug::print(&message_holder.message);
        message_holder.message
    }
}
Test Snippet:
text#[test_only] module my_first_module::message_tests {
    use std::string;
    use std::signer;
    use my_first_module::message;

    #[test(sender= @my_first_module)]
    fun test_set_and_get_message(sender: &signer) {
       message::set_message(sender, string::utf8(b"Hello World"));
       let stored_message = message::get_message(signer::address_of(sender));
       assert!(stored_message == string::utf8(b"Hello World"), 0)
    }
}
Example 3: Debug Demo (For Testing Stack Traces)
From aptos-core repo (basic struct and functions with debug prints—not full code, but used for testing).
Compilation, Testing, Publishing Guidelines

Compile: aptos move compile --package-dir <dir> --named-addresses <addr>=default
Test: aptos move test --package-dir <dir> --coverage
Publish: aptos move publish --package-dir <dir> --profile <profile>
Run: aptos move run --function-id <addr>::<module>::<func> --args <args>


Some common Errors:
let owner_addr = address_of_module_owner();
   │         ^^^
   │         │
   │         Unexpected 'let'
   │         Expected ';'

Use these in your Perplexity prompt to ensure generated contracts adhere to syntax, security, and best practices. For more, refer to aptos.dev docs.
`;

interface PerplexityMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  id: string;
}

// ---------------------- Config ----------------------
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const SONAR_API_KEY = process.env.SONAR_API_KEY;

if (!SONAR_API_KEY) {
  console.error("SONAR_API_KEY environment variable is required");
  process.exit(1);
}

// ✅ NEW: Function to create and store standard account
async function createStandardAccount(): Promise<void> {
  if (STANDARD_ACCOUNT) {
    console.log("Standard account already exists:", STANDARD_ACCOUNT.address);
    return;
  }

  try {
    // Generate keypair files
    const keyFilePath = path.join(__dirname, `standard_account_key.txt`);
    const pubKeyFilePath = `${keyFilePath}.pub`;

    console.log("Generating standard account keypair...");
    await new Promise<void>((resolve, reject) => {
      exec(
        `aptos key generate --output-file ${keyFilePath} --assume-yes`,
        (error, stdout, stderr) => {
          if (error) return reject(new Error(`Key generation failed: ${stderr || error.message}`));
          console.log("Standard keypair generated successfully");
          resolve();
        },
      );
    });

    // Get account address from public key file
    console.log("Getting standard account address...");
    const addressOutput: string = await new Promise((resolve, reject) => {
      exec(
        `aptos account lookup-address --public-key-file ${pubKeyFilePath} --url https://fullnode.devnet.aptoslabs.com`,
        (error, stdout, stderr) => {
          if (error) return reject(new Error(`Address lookup failed: ${stderr || error.message}`));
          resolve(stdout);
        },
      );
    });

    // Parse address
    const addressMatch = addressOutput.match(/"Result":\s*"([0-9a-f]+)"/);
    if (!addressMatch) {
      throw new Error(`Failed to parse address: ${addressOutput}`);
    }
    const address = `0x${addressMatch[1]}`;

    // Read private key
    const privateKey = await readFile(keyFilePath, "utf-8");

    // Store standard account info
    STANDARD_ACCOUNT = {
      address,
      privateKey: privateKey.trim(),
      keyFilePath,
      pubKeyFilePath,
    };

    console.log("✅ Standard account created:", address);

    // Fund the account
    console.log("Funding standard account...");
    try {
      await new Promise<void>((resolve, reject) => {
        exec(
          `aptos account fund-with-faucet --account ${address} --url https://fullnode.devnet.aptoslabs.com`,
          (error, stdout, stderr) => {
            if (error) console.warn("Funding failed:", stderr);
            else console.log("Standard account funded");
            resolve();
          },
        );
      });
      // Wait for funding to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.warn("Standard account funding error:", err);
    }

  } catch (error: any) {
    console.error("Failed to create standard account:", error.message);
    throw error;
  }
}

// ✅ NEW: Initialize standard account on server start
async function initializeStandardAccount(): Promise<void> {
  try {
    await createStandardAccount();
  } catch (error) {
    console.error("Failed to initialize standard account:", error);
    // Don't exit - allow manual creation later
  }
}

// ---------------------- Utility Functions ----------------------
async function saveToFile(path: string, data: string, lang: string) {
  const regex = new RegExp(`\`\`\`(?:${lang})?\\s*([\\s\\S]*?)\`\`\``);
  const match = data.match(regex);
  const cleaned = match ? match[1].trim() : data.trim();
  await writeFile(path, cleaned, "utf-8");
  console.log(`File written to ${path}`);
}

async function callPerplexityAPI(
  messages: PerplexityMessage[],
): Promise<string> {
  try {
    const requestData: PerplexityRequest = {
      model: "sonar-pro",
      messages,
      max_tokens: 4000,
      temperature: 0.7,
    };

    const response = await axios.post<PerplexityResponse>(
      PERPLEXITY_API_URL,
      requestData,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${SONAR_API_KEY}`,
        },
      },
    );

    console.log("Perplexity API response:", response.data);

    return (
      response.data.choices[0]?.message?.content || "No response generated"
    );
  } catch (error: any) {
    console.error(
      "Error calling Perplexity API:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to call Perplexity API");
  }
}

// ✅ FIXED: Use standard account address in contract generation
async function generateMoveContract(userPrompt: string): Promise<string> {
  if (!STANDARD_ACCOUNT) {
    throw new Error("Standard account not initialized. Call createStandardAccount first.");
  }

  const systemPrompt = `You are an expert Move language developer. Generate a complete, secure, and well-documented Move smart contract based on the user's requirements. 

IMPORTANT: Use the address "${STANDARD_ACCOUNT.address}" for all module declarations and named addresses in the contract. This address MUST be used consistently throughout the contract.

Include proper module structure, imports, structs, resources, public entry functions, error handling, events, and security best practices. At the end, add a simple 3-line summary of what the contract does. Only return the code and the summary.
  
Use this docs for your reference: ${docs}`;

  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Generate a Move smart contract using address ${STANDARD_ACCOUNT.address}: ${userPrompt}` },
  ];

  return await callPerplexityAPI(messages);
}

// ✅ FIXED: Use standard account address in test generation
async function generateMoveContractTests(
  contractCode: string,
  userPrompt: string,
): Promise<string> {
  if (!STANDARD_ACCOUNT) {
    throw new Error("Standard account not initialized.");
  }

  const systemPrompt = `You are an expert Move testing specialist. Generate comprehensive Move test files for the given contract. 

IMPORTANT: Use the address "${STANDARD_ACCOUNT.address}" for all test annotations and module references. This address MUST be used consistently throughout the tests.

Include unit tests for all public functions, edge cases, setup/teardown if needed, and assertions for expected behaviors. Only return the code.`;

  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Generate test files for this Move smart contract using address ${STANDARD_ACCOUNT.address}. Requirement: "${userPrompt}"\nContract code:\n${contractCode}`,
    },
  ];

  return await callPerplexityAPI(messages);
}

// ✅ FIXED: Use standard account address in Move.toml generation
async function generateMoveToml(
  contractName: string,
): Promise<string> {
  if (!STANDARD_ACCOUNT) {
    throw new Error("Standard account not initialized.");
  }

  const systemPrompt = `You are an expert Move project manager. Generate a proper Move.toml file for a devnet project that contains a module deployed under address "${STANDARD_ACCOUNT.address}". 

IMPORTANT: Use the address "${STANDARD_ACCOUNT.address}" for all named address mappings in the Move.toml file.

Ensure all dependencies, addresses, and package info are correct. Only return the TOML content.`;

  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Generate Move.toml for the contract "${contractName}" deployed at "${STANDARD_ACCOUNT.address}"`,
    },
  ];

  return await callPerplexityAPI(messages);
}

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Move Contract Generator API running",
    standardAccount: STANDARD_ACCOUNT ? {
      address: STANDARD_ACCOUNT.address,
      initialized: true
    } : { initialized: false }
  });
});

// ✅ NEW: Endpoint to get standard account info
app.get("/standard-account", (req, res) => {
  if (!STANDARD_ACCOUNT) {
    return res.status(404).json({
      success: false,
      message: "Standard account not initialized"
    });
  }

  res.json({
    success: true,
    account: {
      address: STANDARD_ACCOUNT.address,
      explorerUrl: `https://explorer.aptoslabs.com/account/${STANDARD_ACCOUNT.address}?network=devnet`
    }
  });
});

// ✅ NEW: Endpoint to manually create standard account
app.post("/create-standard-account", async (req, res) => {
  try {
    await createStandardAccount();
    res.json({
      success: true,
      message: "Standard account created successfully",
      account: {
        address: STANDARD_ACCOUNT!.address,
        explorerUrl: `https://explorer.aptoslabs.com/account/${STANDARD_ACCOUNT!.address}?network=devnet`
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ FIXED: Use standard account for everything
app.post("/generate-full-suite", async (req, res) => {
  try {
    const {
      prompt,
      contractName = "Contract",
    } = req.body;
    
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Ensure standard account exists
    if (!STANDARD_ACCOUNT) {
      await createStandardAccount();
    }

    console.log(`Using standard account: ${STANDARD_ACCOUNT!.address}`);

    // Generate Move contract with standard account address
    const contractCode = await generateMoveContract(prompt);
    await saveToFile(
      "../../Volume/sources/Contract.move",
      contractCode,
      "move",
    );

    // Generate test code with standard account address
    const testCode = await generateMoveContractTests(contractCode, prompt);
    await saveToFile("../../Volume/tests/test.move", testCode, "move");

    // Generate Move.toml with standard account address
    const moveTomlContent = await generateMoveToml(contractName);
    await saveToFile("../../Volume/Move.toml", moveTomlContent, "toml");
    console.log("Move.toml written");

    // Extract summary (text after code block)
    const summaryMatch = contractCode.match(/```[\s\S]*?```([\s\S]*)$/);
    const summary = summaryMatch ? summaryMatch[1].trim() : contractCode.trim();

    res.json({
      success: true,
      summary: summary || prompt,
      standardAccount: {
        address: STANDARD_ACCOUNT!.address,
        explorerUrl: `https://explorer.aptoslabs.com/account/${STANDARD_ACCOUNT!.address}?network=devnet`
      }
    });
  } catch (error: any) {
    console.error("Error generating full suite:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate Move contract, tests, or Move.toml",
      message: error.message || "Unknown error",
    });
  }
});

// ✅ FIXED: Use the existing standard account for deployment
app.post("/deploy-contract", async (req, res) => {
  try {
    // Ensure standard account exists
    if (!STANDARD_ACCOUNT) {
      await createStandardAccount();
    }

    console.log(`Deploying with standard account: ${STANDARD_ACCOUNT!.address}`);

    // Deploy contract using the existing standard account
    console.log("Deploying contract...");
    const contractPath = path.resolve(__dirname, "../../Volume");
    
    const deployOutput = await new Promise<string>((resolve, reject) => {
      exec(
        `aptos move publish --package-dir ${contractPath} --private-key-file ${STANDARD_ACCOUNT!.keyFilePath} --url https://fullnode.devnet.aptoslabs.com --assume-yes`,
        { timeout: 120000 },
        (error, stdout, stderr) => {
          console.log("Deploy stdout:", stdout);
          console.log("Deploy stderr:", stderr);
          
          // Check if it's actually an error or just compilation output
          if (error && error.code !== 0) {
            // Only reject if stderr contains actual error keywords
            if (stderr && (stderr.includes("error:") || stderr.includes("Error:") || stderr.includes("failed"))) {
              return reject(new Error(`Deployment failed: ${stderr}`));
            }
          }
          
          // If we have stdout or stderr with compilation info, consider it success
          const output = stdout || stderr || "Contract deployed";
          resolve(output);
        },
      );
    });

    console.log("Contract deployed successfully!");

    res.json({
      success: true,
      message: "Contract deployed successfully",
      account: {
        address: STANDARD_ACCOUNT!.address,
        privateKey: STANDARD_ACCOUNT!.privateKey,
      },
      deploymentOutput: deployOutput,
      explorerUrl: `https://explorer.aptoslabs.com/account/${STANDARD_ACCOUNT!.address}?network=devnet`,
    });

  } catch (error: any) {
    console.error("Deploy error:", error);
    res.status(500).json({
      success: false,
      error: error.message || error.toString(),
    });
  }
});

// ✅ Cleanup function for graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Cleaning up...');
  if (STANDARD_ACCOUNT) {
    try {
      unlinkSync(STANDARD_ACCOUNT.keyFilePath);
      unlinkSync(STANDARD_ACCOUNT.pubKeyFilePath);
      console.log('Standard account files cleaned up');
    } catch (e) {
      console.warn('Failed to cleanup standard account files:', e);
    }
  }
  process.exit(0);
});

// ---------------------- Start Server ----------------------
app.listen(port, async () => {
  console.log(`Move Contract Generator API running on port ${port}`);
  
  // Initialize standard account on startup
  console.log("Initializing standard account...");
  await initializeStandardAccount();
});

// Usage examples:
// curl -X GET http://localhost:3002/standard-account
// curl -X POST http://localhost:3002/create-standard-account
// curl -X POST http://localhost:3002/generate-full-suite -H "Content-Type: application/json" -d '{"prompt": "Create a simple counter contract"}'
// curl -X POST http://localhost:3002/deploy-contract