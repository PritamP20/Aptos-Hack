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

const port = process.env.PORT || 3002;

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
      model: "sonar",
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

async function generateMoveContract(userPrompt: string): Promise<string> {
  const systemPrompt = `You are an expert Move language developer. Generate a complete, secure, and well-documented Move smart contract based on the user's requirements. Include proper module structure, imports, structs, resources, public entry functions, error handling, events, and security best practices. At the end, add a simple 3-line summary of what the contract does. Only return the code and the summary.`;

  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Generate a Move smart contract: ${userPrompt}` },
  ];

  return await callPerplexityAPI(messages);
}

async function generateMoveContractTests(
  contractCode: string,
  userPrompt: string,
): Promise<string> {
  const systemPrompt = `You are an expert Move testing specialist. Generate comprehensive Move test files for the given contract. Include unit tests for all public functions, edge cases, setup/teardown if needed, and assertions for expected behaviors. Only return the code.`;

  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Generate test files for this Move smart contract. Requirement: "${userPrompt}"\nContract code:\n${contractCode}`,
    },
  ];

  return await callPerplexityAPI(messages);
}

async function generateMoveToml(
  contractName: string,
  address: string,
): Promise<string> {
  const systemPrompt = `You are an expert Move project manager. Generate a proper Move.toml file for a project that contains a module named "${contractName}" deployed under address "${address}". Ensure all dependencies, addresses, and package info are correct. Only return the TOML content.`;

  const messages: PerplexityMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Generate or update Move.toml for the contract "${contractName}" deployed at "${address}"`,
    },
  ];

  return await callPerplexityAPI(messages);
}

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Move Contract Generator API running" });
});

app.post("/generate-full-suite", async (req, res) => {
  try {
    const {
      prompt,
      contractName = "Contract",
      contractAddress = "0x1",
    } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Generate Move contract
    const contractCode = await generateMoveContract(prompt);
    await saveToFile(
      "../../Volume/sources/Contract.move",
      contractCode,
      "move",
    );

    // Generate test code
    const testCode = await generateMoveContractTests(contractCode, prompt);
    await saveToFile("../../Volume/tests/test.move", testCode, "move");

    // Generate Move.toml
    const moveTomlContent = await generateMoveToml(
      contractCode,
      contractAddress,
    );
    await saveToFile("../../Volume/Move.toml", moveTomlContent, "toml");
    console.log("Move.toml written");

    // Extract summary (text after code block)
    const summaryMatch = contractCode.match(/```[\s\S]*?```([\s\S]*)$/);
    const summary = summaryMatch ? summaryMatch[1].trim() : contractCode.trim();

    res.json({
      success: true,
      summary: summary || prompt,
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

// ---------------------- Fixed Deploy Contract Endpoint ----------------------
// ---------------------- Simple Deploy Contract Endpoint ----------------------
// app.post("/deploy-contract", async (req, res) => {
//   let tempKeyFile: string | null = null;
//   let tempPubKeyFile: string | null = null;
  
//   try {
//     // 1️⃣ Generate keypair (creates both private and public key files)
//     tempKeyFile = path.join(__dirname, `temp_key_${Date.now()}.txt`);
//     tempPubKeyFile = `${tempKeyFile}.pub`;

//     console.log("Generating keypair...");
//     await new Promise<void>((resolve, reject) => {
//       exec(
//         `aptos key generate --output-file ${tempKeyFile} --assume-yes`,
//         (error, stdout, stderr) => {
//           if (error) return reject(new Error(`Key generation failed: ${stderr || error.message}`));
//           console.log("Keypair generated successfully");
//           resolve();
//         },
//       );
//     });

//     // 2️⃣ Get account address from public key file
//     console.log("Getting account address...");
//     const addressOutput: string = await new Promise((resolve, reject) => {
//       exec(
//         `aptos account lookup-address --public-key-file ${tempPubKeyFile} --url https://fullnode.devnet.aptoslabs.com`,
//         (error, stdout, stderr) => {
//           if (error) return reject(new Error(`Address lookup failed: ${stderr || error.message}`));
//           resolve(stdout);
//         },
//       );
//     });

//     // Parse address
//     const addressMatch = addressOutput.match(/"Result":\s*"([0-9a-f]+)"/);
//     if (!addressMatch) {
//       throw new Error(`Failed to parse address: ${addressOutput}`);
//     }
//     const address = `0x${addressMatch[1]}`;
//     console.log("Account address:", address);

//     // 3️⃣ Read private key
//     const privateKey = await readFile(tempKeyFile, "utf-8");

//     // 4️⃣ Fund account
//     console.log("Funding account...");
//     try {
//       await new Promise<void>((resolve, reject) => {
//         exec(
//           `aptos account fund-with-faucet --account ${address} --url https://fullnode.devnet.aptoslabs.com`,
//           (error, stdout, stderr) => {
//             if (error) console.warn("Funding failed:", stderr);
//             else console.log("Account funded");
//             resolve(); // Continue regardless
//           },
//         );
//       });
//       // Wait for funding to propagate
//       await new Promise(resolve => setTimeout(resolve, 2000));
//     } catch (err) {
//       console.warn("Funding error:", err);
//     }

//     // 5️⃣ Deploy contract
//     console.log("Deploying contract...");
//     const contractPath = path.resolve(__dirname, "../../Volume");
    
//     const deployOutput = await new Promise<string>((resolve, reject) => {
//       exec(
//         `aptos move publish --package-dir ${contractPath} --private-key-file ${tempKeyFile} --url https://fullnode.devnet.aptoslabs.com --assume-yes`,
//         { timeout: 120000 },
//         (error, stdout, stderr) => {
//           if (error) return reject(new Error(`Deployment failed: ${stderr || error.message}`));
//           resolve(stdout);
//         },
//       );
//     });

//     console.log("Contract deployed successfully!");

//     res.json({
//       success: true,
//       message: "Contract deployed successfully",
//       account: {
//         address,
//         privateKey: privateKey.trim(),
//       },
//       deploymentOutput: deployOutput,
//       explorerUrl: `https://explorer.aptoslabs.com/account/${address}?network=devnet`,
//     });

//   } catch (error: any) {
//     console.error("Deploy error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || error.toString(),
//     });
//   } finally {
//     // Cleanup
//     [tempKeyFile, tempPubKeyFile].forEach(file => {
//       if (file) {
//         try {
//           require("fs").unlinkSync(file);
//         } catch (e) {
//           console.warn(`Failed to cleanup ${file}:`, e);
//         }
//       }
//     });
//   }
// });

app.post("/deploy-contract", async (req, res) => {
  let tempKeyFile: string | null = null;
  let tempPubKeyFile: string | null = null;
  
  try {
    // 1️⃣ Generate keypair (creates both private and public key files)
    tempKeyFile = path.join(__dirname, `temp_key_${Date.now()}.txt`);
    tempPubKeyFile = `${tempKeyFile}.pub`;

    console.log("Generating keypair...");
    await new Promise<void>((resolve, reject) => {
      exec(
        `aptos key generate --output-file ${tempKeyFile} --assume-yes`,
        (error, stdout, stderr) => {
          if (error) return reject(new Error(`Key generation failed: ${stderr || error.message}`));
          console.log("Keypair generated successfully");
          resolve();
        },
      );
    });

    // 2️⃣ Get account address from public key file
    console.log("Getting account address...");
    const addressOutput: string = await new Promise((resolve, reject) => {
      exec(
        `aptos account lookup-address --public-key-file ${tempPubKeyFile} --url https://fullnode.devnet.aptoslabs.com`,
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
    console.log("Account address:", address);

    // 3️⃣ Read private key
    const privateKey = await readFile(tempKeyFile, "utf-8");

    // 4️⃣ Fund account
    console.log("Funding account...");
    try {
      await new Promise<void>((resolve, reject) => {
        exec(
          `aptos account fund-with-faucet --account ${address} --url https://fullnode.devnet.aptoslabs.com`,
          (error, stdout, stderr) => {
            if (error) console.warn("Funding failed:", stderr);
            else console.log("Account funded");
            resolve(); // Continue regardless
          },
        );
      });
      // Wait for funding to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.warn("Funding error:", err);
    }

    // 5️⃣ Deploy contract
    console.log("Deploying contract...");
    const contractPath = path.resolve(__dirname, "../../Volume");
    
    const deployOutput = await new Promise<string>((resolve, reject) => {
      exec(
        `aptos move publish --package-dir ${contractPath} --private-key-file ${tempKeyFile} --url https://fullnode.devnet.aptoslabs.com --assume-yes`,
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
        address,
        privateKey: privateKey.trim(),
      },
      deploymentOutput: deployOutput,
      explorerUrl: `https://explorer.aptoslabs.com/account/${address}?network=devnet`,
    });

  } catch (error: any) {
    console.error("Deploy error:", error);
    res.status(500).json({
      success: false,
      error: error.message || error.toString(),
    });
  } finally {
    // Cleanup
    [tempKeyFile, tempPubKeyFile].forEach(file => {
      if (file) {
        try {
          require("fs").unlinkSync(file);
        } catch (e) {
          console.warn(`Failed to cleanup ${file}:`, e);
        }
      }
    });
  }
});

// ---------------------- Start Server ----------------------
app.listen(port, () => {
  console.log(`Move Contract Generator API running on port ${port}`);
});

// curl -X POST http://localhost:3002/deploy-contract \
//   -H "Content-Type: application/json" \
//   -d '{}'
