"use client";
import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, Send, Bot, Wallet, User, LogOut, AlertCircle, Key, Copy, X } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { HexString } from "aptos";
import axios from "axios";
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Message {
  text: string;
  sender: string;
  timestamp: string;
  isError?: boolean;
}

interface DeploymentInfo {
  privateKey: string;
  contractAddress: string;
}

const Page = () => {
  const { account, connected, wallet, wallets: walletList, connect, disconnect, signAndSubmitTransaction } = useWallet();

  const wallets = walletList || []; 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize Aptos client
  const aptosConfig = new AptosConfig({ network: Network.DEVNET });
  const aptos = new Aptos(aptosConfig);
  
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:3002");
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);

  const bgClass = isDark ? "bg-black" : "bg-white";
  const textClass = isDark ? "text-white" : "text-black";
  const borderClass = isDark ? "border-gray-700" : "border-gray-300";
  const cardClass = isDark ? "bg-gray-900" : "bg-gray-50";

  // Updated contract address to match the new contract
  const CONTRACT_ADDRESS = "0x5557ce722c8986927d41d146a4699649a0222c9e738fd8f6e97183d18644865b";

  // Toast configuration
  const toastConfig = {
    position: "top-right" as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: isDark ? "dark" : "light",
    transition: Bounce,
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      text: "Welcome! I'm your AI assistant. Connect your wallet to get started with advanced features.",
      sender: "ai",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Check if storage is initialized when wallet connects
  useEffect(() => {
    if (connected && account) {
      setTimeout(() => {
        checkStorageInitialization();
      }, 1000);
    }
  }, [connected, account]);

  const addMessage = (text: string, sender: string, isError = false) => {
    const message = {
      text,
      sender,
      timestamp: new Date().toISOString(),
      isError,
    };
    setMessages((prev) => [...prev, message]);
  };

  const checkStorageInitialization = async () => {
    if (!account) return;

    try {
      const hasStorageResult = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::KeyStorage::has_storage`,
          typeArguments: [],
          functionArguments: [account.address.toString()],
        },
      });

      if (hasStorageResult[0] === true) {
        const keyCountResult = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::KeyStorage::key_count`,
            typeArguments: [],
            functionArguments: [account.address.toString()],
          },
        });

        setIsStorageInitialized(true);
        toast.success(`Storage initialized! Key count: ${keyCountResult[0]}`, toastConfig);
      } else {
        setIsStorageInitialized(false);
        toast.info("Storage needs initialization for your account.", toastConfig);
      }
    } catch (error: any) {
      console.error("Storage check error:", error);
      setIsStorageInitialized(false);
      
      if (error.message?.includes("FUNCTION_NOT_FOUND") || error.message?.includes("MODULE_NOT_FOUND")) {
        toast.error("Contract not found. Please deploy the contract first.", toastConfig);
      } else if (error.message?.includes("not an view function")) {
        toast.error("Contract view functions not properly configured.", toastConfig);
      } else {
        toast.warning("Could not check storage status.", toastConfig);
      }
    }
  };

  const testContractExists = async () => {
    if (!account) {
      toast.error("Please connect your wallet first.", toastConfig);
      return;
    }

    try {
      const hasStorageResult = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::KeyStorage::has_storage`,
          typeArguments: [],
          functionArguments: [account.address.toString()],
        },
      });

      toast.success(`Contract found! Storage exists: ${hasStorageResult[0]}`, toastConfig);

      if (hasStorageResult[0] === true) {
        const keyCountResult = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::KeyStorage::key_count`,
            typeArguments: [],
            functionArguments: [account.address.toString()],
          },
        });

        toast.info(`Key count: ${keyCountResult[0]}`, toastConfig);
        setIsStorageInitialized(true);
      } else {
        setIsStorageInitialized(false);
      }
      
    } catch (err: any) {
      console.error("Contract test error:", err);
      
      if (err.message?.includes("FUNCTION_NOT_FOUND") || err.message?.includes("MODULE_NOT_FOUND")) {
        toast.error("Contract not found at this address.", toastConfig);
      } else if (err.message?.includes("RESOURCE_DOES_NOT_EXIST")) {
        toast.info("Contract exists but storage not initialized.", toastConfig);
        setIsStorageInitialized(false);
      } else {
        toast.error(`Contract test failed: ${err.message || 'Unknown error'}`, toastConfig);
      }
    }
  };

  const initializeStorage = async () => {
    if (!account || !wallet) {
      toast.error("Please connect your wallet first.", toastConfig);
      return false;
    }

    setIsProcessing(true);

    try {
      const transaction = {
        data: {
          function: `${CONTRACT_ADDRESS}::KeyStorage::init_storage`,
          typeArguments: [],
          functionArguments: [],
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      
      if (response.hash) {
        toast.success(`Storage initialization submitted! Hash: ${response.hash.slice(0, 10)}...`, toastConfig);
        
        try {
          await aptos.waitForTransaction({ 
            transactionHash: response.hash,
            options: { timeoutSecs: 30 }
          });
          toast.success("Storage initialization confirmed!", toastConfig);
        } catch (waitError) {
          toast.warning("Transaction submitted but confirmation timeout.", toastConfig);
        }
        
        setTimeout(async () => {
          try {
            await checkStorageInitialization();
          } catch (e) {
            console.log("Post-init check failed");
          }
        }, 3000);
        
        setIsStorageInitialized(true);
        return true;
      } else {
        throw new Error("No transaction hash received");
      }
    } catch (err: any) {
      console.error("Failed to initialize storage:", err);
      
      if (err.message?.includes("RESOURCE_ALREADY_EXISTS")) {
        toast.success("Storage already exists for this account!", toastConfig);
        setIsStorageInitialized(true);
        return true;
      } else if (err.message?.includes("INSUFFICIENT_BALANCE")) {
        toast.error("Insufficient balance to pay for transaction fees.", toastConfig);
      } else if (err.message?.includes("USER_CANCEL")) {
        toast.warning("Transaction was cancelled by user.", toastConfig);
      } else {
        toast.error(`Initialization failed: ${err.message || 'Unknown error'}`, toastConfig);
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const storeKey = async (key: string) => {
    if (!account || !wallet) {
      toast.error("Please connect your wallet first.", toastConfig);
      return;
    }

    setIsProcessing(true);

    try {
      if (!isStorageInitialized) {
        toast.info("Storage not initialized. Initializing first...", toastConfig);
        const initialized = await initializeStorage();
        if (!initialized) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const keyBytes = Array.from(new TextEncoder().encode(key));
      
      const transaction = {
        data: {
          function: `${CONTRACT_ADDRESS}::KeyStorage::add_key`,
          typeArguments: [],
          functionArguments: [keyBytes],
        },
      };

      const response = await signAndSubmitTransaction(transaction);

      if (response.hash) {
        toast.success(`Key storage submitted! Hash: ${response.hash.slice(0, 10)}...`, toastConfig);
        
        try {
          await aptos.waitForTransaction({ 
            transactionHash: response.hash,
            options: { timeoutSecs: 30 }
          });
          toast.success("Key stored successfully!", toastConfig);
          
          setTimeout(() => {
            checkStorageInitialization();
          }, 1000);
        } catch (waitError) {
          toast.warning("Key storage transaction submitted but confirmation timeout.", toastConfig);
        }
      } else {
        throw new Error("No transaction hash received");
      }
    } catch (err: any) {
      console.error("Failed to store key:", err);
      
      if (err.message?.includes("RESOURCE_DOES_NOT_EXIST")) {
        toast.error("Storage not initialized. Please initialize storage first.", toastConfig);
        setIsStorageInitialized(false);
      } else if (err.message?.includes("USER_CANCEL")) {
        toast.warning("Transaction was cancelled by user.", toastConfig);
      } else {
        toast.error(`Failed to store key: ${err.message || 'Unknown error'}`, toastConfig);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const DeployContract = async () => {
    setIsProcessing(true);

    try {
      const response = await axios.post(`${apiUrl}/deploy-contract`);
      console.log(response.data);

      if (response.data.success) {
        // Set deployment info for modal
        setDeploymentInfo({
          privateKey: response.data.account.privateKey || "Not provided",
          contractAddress: response.data.account.address || CONTRACT_ADDRESS
        });
        setShowDeploymentModal(true);
        
        toast.success("Contract deployed successfully!", toastConfig);
        
        // Automatically store a key after deployment
        setTimeout(() => {
          storeKey("MySecretKey123");
        }, 2000);
      } else {
        toast.error("Contract deployment failed.", toastConfig);
      }
    } catch (error) {
      console.error("Deployment error:", error);
      toast.error("Error deploying contract. Please check if the server is running.", toastConfig);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`, toastConfig);
    } catch (err) {
      toast.error(`Failed to copy ${label}`, toastConfig);
    }
  };

  const getAllKeys = async () => {
    if (!account) {
      toast.error("Please connect your wallet first.", toastConfig);
      return;
    }

    try {
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::KeyStorage::get_all_keys`,
          typeArguments: [],
          functionArguments: [account.address.toString()],
        },
      });

      const keys = result[0] as number[][];
      
      if (keys.length === 0) {
        toast.info("No keys stored yet.", toastConfig);
      } else {
        const keyStrings = keys.map((keyBytes: number[]) => {
          try {
            return new TextDecoder().decode(new Uint8Array(keyBytes));
          } catch {
            return `[Binary data: ${keyBytes.length} bytes]`;
          }
        });
        
        addMessage(`📝 Found ${keys.length} keys:\n${keyStrings.map((key, i) => `${i + 1}. ${key}`).join('\n')}`, "ai");
      }
    } catch (err: any) {
      console.error("Failed to get all keys:", err);
      
      if (err.message?.includes("RESOURCE_DOES_NOT_EXIST")) {
        toast.error("Storage not initialized. Please initialize storage first.", toastConfig);
        setIsStorageInitialized(false);
      } else {
        toast.error(`Error fetching keys: ${err.message || 'Unknown error'}`, toastConfig);
      }
    }
  };

  // New function to get a specific key by index
  const getKeyByIndex = async (index: number) => {
    if (!account) {
      toast.error("Please connect your wallet first.", toastConfig);
      return;
    }

    try {
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::KeyStorage::get_key`,
          typeArguments: [],
          functionArguments: [account.address.toString(), index.toString()],
        },
      });

      const keyBytes = result[0] as number[];
      const keyString = new TextDecoder().decode(new Uint8Array(keyBytes));
      
      addMessage(`🔑 Key at index ${index}: ${keyString}`, "ai");
    } catch (err: any) {
      console.error("Failed to get key by index:", err);
      
      if (err.message?.includes("INDEX_OUT_OF_BOUNDS")) {
        toast.error(`Index ${index} is out of bounds.`, toastConfig);
      } else if (err.message?.includes("RESOURCE_DOES_NOT_EXIST")) {
        toast.error("Storage not initialized. Please initialize storage first.", toastConfig);
        setIsStorageInitialized(false);
      } else {
        toast.error(`Error fetching key: ${err.message || 'Unknown error'}`, toastConfig);
      }
    }
  };

  // New function to check if a specific key exists
  const checkKeyExists = async (key: string) => {
    if (!account) {
      toast.error("Please connect your wallet first.", toastConfig);
      return;
    }

    try {
      const keyBytes = Array.from(new TextEncoder().encode(key));
      
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::KeyStorage::has_key`,
          typeArguments: [],
          functionArguments: [account.address.toString(), keyBytes],
        },
      });

      const exists = result[0] as boolean;
      
      if (exists) {
        addMessage(`✅ Key "${key}" exists in your storage.`, "ai");
      } else {
        addMessage(`❌ Key "${key}" does not exist in your storage.`, "ai");
      }
    } catch (err: any) {
      console.error("Failed to check key existence:", err);
      toast.error(`Error checking key: ${err.message || 'Unknown error'}`, toastConfig);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string | null> => {
    try {
      const response = await fetch(`${apiUrl}/generate-full-suite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: userMessage,
          walletAddress: account?.address ? account.address.toString() : null,
          connected: connected
        }),
      });

      if (!response.ok) {
        console.error("API call failed:", response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log("API response data:", data);
      return data.summary || data.response || "I received your message but couldn't generate a proper response.";
    } catch (error) {
      console.error("Error calling AI API:", error);
      return null;
    }
  };

  const handleWalletConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setShowWalletOptions(false);
      
      setTimeout(() => {
        const address = account?.address?.toString() || "Unknown";
        toast.success(`Wallet connected! Address: ${formatAddress(address)}`, toastConfig);
      }, 500);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet. Please try again.", toastConfig);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
      setIsStorageInitialized(false);
      toast.success("Wallet disconnected successfully.", toastConfig);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast.error("Failed to disconnect wallet.", toastConfig);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessageText = inputMessage.trim();
    setInputMessage("");
    
    addMessage(userMessageText, "user");
    setIsProcessing(true);

    try {
      // Handle special commands
      if (userMessageText.toLowerCase().includes("store key")) {
        const keyMatch = userMessageText.match(/store key[:\s]+"?([^"]+)"?/i);
        if (keyMatch) {
          await storeKey(keyMatch[1].trim());
          setIsProcessing(false);
          return;
        }
      }

      if (userMessageText.toLowerCase().includes("get all keys") || userMessageText.toLowerCase().includes("list keys")) {
        await getAllKeys();
        setIsProcessing(false);
        return;
      }

      // New command: get key by index
      if (userMessageText.toLowerCase().includes("get key")) {
        const indexMatch = userMessageText.match(/get key[:\s]+(\d+)/i);
        if (indexMatch) {
          await getKeyByIndex(parseInt(indexMatch[1]));
          setIsProcessing(false);
          return;
        }
      }

      // New command: check if key exists
      if (userMessageText.toLowerCase().includes("check key")) {
        const keyMatch = userMessageText.match(/check key[:\s]+"?([^"]+)"?/i);
        if (keyMatch) {
          await checkKeyExists(keyMatch[1].trim());
          setIsProcessing(false);
          return;
        }
      }

      if (userMessageText.toLowerCase().includes("init storage") || userMessageText.toLowerCase().includes("initialize storage")) {
        await initializeStorage();
        setIsProcessing(false);
        return;
      }

      if (userMessageText.toLowerCase().includes("test contract")) {
        await testContractExists();
        setIsProcessing(false);
        return;
      }

      if (userMessageText.toLowerCase().includes("check storage")) {
        await checkStorageInitialization();
        setIsProcessing(false);
        return;
      }

      // Generate AI response
      const aiResponseText = await generateAIResponse(userMessageText);

      if (aiResponseText) {
        addMessage(aiResponseText, "ai");
      } else {
        addMessage("Sorry, I encountered an error while processing your request. Please check if the server is running and try again.", "ai", true);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      addMessage("Sorry, I encountered an unexpected error. Please try again.", "ai", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address?: HexString | string) => {
    if (!address) return "Unknown";
    const addrStr = typeof address === "string" ? address : address.toString();
    return `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}`;
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      addMessage("Chat cleared! How can I help you today?", "ai");
    }, 100);
  };

  // Handle click outside to close wallet options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showWalletOptions && !target.closest('.wallet-dropdown')) {
        setShowWalletOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showWalletOptions]);

  return (
    <div className={`flex ${bgClass} ${textClass} h-screen overflow-hidden`}>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
        transition={Bounce}
      />

      {/* Deployment Modal */}
      {showDeploymentModal && deploymentInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardClass} ${borderClass} border rounded-lg shadow-lg max-w-md w-full mx-4 p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Contract Deployed Successfully!</h3>
              <button
                onClick={() => setShowDeploymentModal(false)}
                className={`p-1 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Private Key:</label>
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${borderClass} ${bgClass}`}>
                  <input
                    type="text"
                    value={deploymentInfo.privateKey}
                    readOnly
                    className={`flex-1 bg-transparent outline-none text-sm`}
                  />
                  <button
                    onClick={() => copyToClipboard(deploymentInfo.privateKey, "Private Key")}
                    className={`p-1 rounded ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"} transition-colors`}
                    title="Copy Private Key"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contract Address:</label>
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${borderClass} ${bgClass}`}>
                  <input
                    type="text"
                    value={deploymentInfo.contractAddress}
                    readOnly
                    className={`flex-1 bg-transparent outline-none text-sm`}
                  />
                  <button
                    onClick={() => copyToClipboard(deploymentInfo.contractAddress, "Contract Address")}
                    className={`p-1 rounded ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"} transition-colors`}
                    title="Copy Contract Address"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? "bg-yellow-900/20" : "bg-yellow-100"} border border-yellow-500/30`}>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ <strong>Important:</strong> Save your private key securely. You'll need it to interact with your deployed contract.
                </p>
              </div>

              <button
                onClick={() => setShowDeploymentModal(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className={`w-1/4 ${cardClass} border-r ${borderClass} flex flex-col h-full`}>
        {/* Header */}
        <div className={`p-4 border-b ${borderClass} flex items-center justify-between flex-shrink-0`}>
          <h1 className="text-xl font-bold">AI Chat</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className={`px-3 py-1 text-sm rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
              disabled={isProcessing}
            >
              Clear
            </button>
            <button
              onClick={DeployContract}
              className={`px-3 py-1 text-sm rounded-lg ${isDark ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-200 hover:bg-blue-300"} transition-colors ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isProcessing}
            >
              {isProcessing ? "..." : "Deploy"}
            </button>
            {connected && (
              <>
                <button
                  onClick={initializeStorage}
                  className={`px-3 py-1 text-sm rounded-lg ${isDark ? "bg-green-700 hover:bg-green-600" : "bg-green-200 hover:bg-green-300"} transition-colors flex items-center gap-1 ${isStorageInitialized ? "opacity-50" : ""}`}
                  disabled={isProcessing}
                  title={isStorageInitialized ? "Storage already initialized" : "Initialize storage for key management"}
                >
                  <Key size={12} />
                  {isStorageInitialized ? "Init'd" : "Init"}
                </button>
                <button
                  onClick={testContractExists}
                  className={`px-3 py-1 text-sm rounded-lg ${isDark ? "bg-purple-700 hover:bg-purple-600" : "bg-purple-200 hover:bg-purple-300"} transition-colors`}
                  disabled={isProcessing}
                  title="Test if contract is deployed and accessible"
                >
                  Test
                </button>
              </>
            )}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Wallet Connection Section */}
        <div className={`p-4 border-b ${borderClass} flex-shrink-0`}>
          {connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} className="text-green-500" />
                <div>
                  <p className="text-sm font-medium">Connected</p>
                  <p className="text-xs opacity-70">
                    {account?.address ? formatAddress(account.address) : 'Loading...'}
                  </p>
                  {isStorageInitialized && (
                    <p className="text-xs text-green-500">✅ Storage ready</p>
                  )}
                  {connected && !isStorageInitialized && (
                    <p className="text-xs text-yellow-500">⚠️ Storage needs init</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleWalletDisconnect}
                className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800 text-red-400" : "hover:bg-gray-100 text-red-500"} transition-colors`}
                title="Disconnect Wallet"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="relative wallet-dropdown">
              <button
                onClick={() => setShowWalletOptions(!showWalletOptions)}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border ${borderClass} ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              >
                <Wallet size={18} />
                <span>Connect Wallet</span>
              </button>
              
              {showWalletOptions && (
                <div className={`absolute top-full left-0 right-0 mt-2 ${cardClass} border ${borderClass} rounded-lg shadow-lg z-10`}>
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2 px-2">Choose Wallet:</p>
                    {wallets && Array.isArray(wallets) && wallets.length > 0 ? (
                      wallets.map((wallet) => (
                        <button
                          key={wallet.name}
                          onClick={() => handleWalletConnect(wallet.name)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"} transition-colors text-left`}
                        >
                          {wallet.icon && (
                            <img 
                              src={wallet.icon} 
                              alt={wallet.name}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-sm">{wallet.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-center">
                        <AlertCircle size={16} className="mx-auto mb-1 opacity-50" />
                        <p className="text-sm text-gray-500">No wallets detected</p>
                        <p className="text-xs text-gray-400 mt-1">Please install a compatible Aptos wallet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages && Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white self-end rounded-br-sm"
                      : msg.sender === "system"
                        ? msg.isError
                          ? "bg-red-500 text-white self-center rounded-lg"
                          : "bg-green-500 text-white self-center rounded-lg"
                        : msg.isError
                          ? "bg-red-500 text-white self-start rounded-bl-sm"
                          : `${isDark ? "bg-gray-700" : "bg-gray-200"} ${isDark ? "text-white" : "text-gray-800"} self-start rounded-bl-sm`
                  }`}
                >
                  {msg.sender === "ai" && !msg.isError && (
                    <div className="flex items-center gap-1 mb-1 opacity-70">
                      <Bot size={12} />
                      <span className="text-xs">AI Assistant</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                </div>
                <span
                  className={`text-xs opacity-50 ${
                    msg.sender === "user" ? "self-end" : 
                    msg.sender === "system" ? "self-center" : "self-start"
                  } px-1`}
                >
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} self-center mt-16 text-center`}
            >
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Welcome to AI Chat</p>
              <p>Connect your wallet and start a conversation</p>
              {!connected && (
                <p className="text-xs mt-2 opacity-70">
                  Wallet connection enables enhanced features
                </p>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-500 text-sm self-start">
              <Bot size={16} className="animate-pulse" />
              <span>AI is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box - Fixed at bottom */}
        <div className={`p-4 border-t ${borderClass} flex-shrink-0`}>
          <div className="flex gap-2">
            <input
              type="text"
              className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${bgClass} ${textClass} ${borderClass}`}
              placeholder="Type your message... (try 'store key: mykey', 'get key 0', 'check key: mykey')"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={isProcessing || !inputMessage.trim()}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                isProcessing || !inputMessage.trim()
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isProcessing ? (
                <Bot size={16} className="animate-pulse" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          <div className="mt-2 text-xs opacity-60">
            <p>Commands: "store key: yourkey", "get key 0", "check key: yourkey", "list keys", "test contract", "init storage"</p>
          </div>
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 h-full overflow-hidden">
        <iframe
          className="w-full h-full border-none"
          src="http://localhost:8080/?folder=/home/coder/project"
          title="Development Environment"
        />
      </div>
    </div>
  );
};

export default Page;