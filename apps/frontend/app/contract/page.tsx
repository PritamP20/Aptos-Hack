"use client";
import React, { useState, useEffect } from "react";
import { Moon, Sun, Send, Bot, Wallet, User, LogOut, Rocket, Key, Copy, Eye, EyeOff, ExternalLink, Database } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient, HexString, Types } from "aptos";

interface Message {
  text: string;
  sender: string;
  timestamp: string;
  isError?: boolean;
  deploymentData?: {
    address: string;
    privateKey: string;
    explorerUrl: string;
  };
  showDeployButton?: boolean;
}

interface DeployedContract {
  address: string;
  privateKey: string;
  explorerUrl: string;
  timestamp: string;
  contractName: string;
  storedOnChain?: boolean;
}

const Page = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
  const [showPrivateKeys, setShowPrivateKeys] = useState<{[key: string]: boolean}>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [isStoringKey, setIsStoringKey] = useState<string | null>(null);
  const [aptosClient] = useState(new AptosClient("https://fullnode.devnet.aptoslabs.com/v1"));

  const bgClass = isDark ? "bg-black" : "bg-white";
  const textClass = isDark ? "text-white" : "text-black";
  const borderClass = isDark ? "border-gray-700" : "border-gray-300";
  const cardClass = isDark ? "bg-gray-900" : "bg-gray-50";

  // Initialize key storage for user (call once when wallet connects)
  const initializeKeyStorage = async () => {
    if (!connected || !account) return;

    try {
      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: "0x1::KeyStorage::init_storage", // Replace with your contract address
        type_arguments: [],
        arguments: [],
      };

      await signAndSubmitTransaction(payload);
      console.log("Key storage initialized");
    } catch (error) {
      console.log("Key storage might already be initialized:", error);
    }
  };

  // Store private key on-chain using user's wallet
  const storeKeyOnChain = async (privateKey: string, contractAddress: string) => {
    if (!connected || !account) {
      alert("Please connect your wallet first");
      return false;
    }

    setIsStoringKey(contractAddress);

    try {
      // Convert private key to bytes
      const keyBytes = Array.from(Buffer.from(privateKey, 'utf8'));

      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: "0x1::KeyStorage::add_key", // Replace with your contract address
        type_arguments: [],
        arguments: [keyBytes],
      };

      const result = await signAndSubmitTransaction(payload);
      console.log("Key stored on-chain:", result);

      // Update local state
      setDeployedContracts(prev => 
        prev.map(contract => 
          contract.address === contractAddress 
            ? { ...contract, storedOnChain: true }
            : contract
        )
      );

      return true;
    } catch (error) {
      console.error("Failed to store key on-chain:", error);
      alert("Failed to store key on-chain: " + error.message);
      return false;
    } finally {
      setIsStoringKey(null);
    }
  };

  // Get stored key count for user
  const getStoredKeyCount = async () => {
    if (!connected || !account) return 0;

    try {
      const response = await aptosClient.view({
        function: "0x1::KeyStorage::key_count", // Replace with your contract address
        type_arguments: [],
        arguments: [account.address.toString()],
      });

      return response[0] as number;
    } catch (error) {
      console.log("Error getting key count:", error);
      return 0;
    }
  };

  // Initialize storage when wallet connects
  useEffect(() => {
    if (connected && account) {
      initializeKeyStorage();
    }
  }, [connected, account]);

  // Generate contract with AI
  const generateAIResponse = async (userMessage: string) => {
    const response = await fetch("http://localhost:3002/generate-full-suite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        prompt: userMessage,
        walletAddress: account?.address ? account.address.toString() : null
      }),
    });

    if (!response.ok) {
      console.error("API call failed:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.summary || data;
  };

  // Deploy contract to blockchain
  const deployContract = async (messageIndex?: number) => {
    setIsDeploying(true);
    
    try {
      const response = await fetch("http://localhost:3002/deploy-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ maxGas: 20000 }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newContract: DeployedContract = {
          address: data.account.address,
          privateKey: data.account.privateKey,
          explorerUrl: data.explorerUrl,
          timestamp: new Date().toISOString(),
          contractName: "Generated Contract",
          storedOnChain: false
        };
        
        setDeployedContracts(prev => [...prev, newContract]);
        
        const deployMessage = {
          text: `Contract deployed successfully!\n\nContract Address: ${data.account.address}\n\nPrivate key generated. You can store it securely on-chain using your connected wallet.`,
          sender: "system",
          timestamp: new Date().toISOString(),
          deploymentData: {
            address: data.account.address,
            privateKey: data.account.privateKey,
            explorerUrl: data.explorerUrl
          }
        };
        
        // Update the message that had the deploy button or add new message
        if (messageIndex !== undefined) {
          setMessages(prev => 
            prev.map((msg, idx) => 
              idx === messageIndex 
                ? { ...msg, showDeployButton: false }
                : msg
            )
          );
        }
        
        setMessages(prev => [...prev, deployMessage]);
        
        return data;
      } else {
        throw new Error(data.error || "Deployment failed");
      }
    } catch (error) {
      console.error("Deployment error:", error);
      const errorMessage = {
        text: `Contract deployment failed: ${error.message}`,
        sender: "system",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      return null;
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsProcessing(true);

    try {
      const aiResponseText = await generateAIResponse(currentInput);
      
      // Check if this looks like a contract generation request
      const isContractRequest = currentInput.toLowerCase().includes('contract') || 
                               currentInput.toLowerCase().includes('deploy') ||
                               currentInput.toLowerCase().includes('create') ||
                               currentInput.toLowerCase().includes('build');
      
      const aiMessage: Message = {
        text: aiResponseText + (isContractRequest ? "\n\nContract files have been generated. Ready to deploy to Aptos devnet?" : ""),
        sender: "ai",
        timestamp: new Date().toISOString(),
        showDeployButton: isContractRequest
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage = {
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const togglePrivateKeyVisibility = (address: string) => {
    setShowPrivateKeys(prev => ({
      ...prev,
      [address]: !prev[address]
    }));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address?: HexString | string) => {
    if (!address) return "";
    const addrStr = typeof address === "string" ? address : address.toString();
    return `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}`;
  };

  return (
    <div className={`flex ${bgClass} ${textClass} min-h-screen`}>
      {/* Chat Interface */}
      <div className={`w-1/4 ${cardClass} border-r ${borderClass} flex flex-col`}>
        {/* Header */}
        <div className={`p-4 border-b ${borderClass} flex items-center justify-between`}>
          <h1 className="text-xl font-bold">AI Contract Studio</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              className={`px-3 py-1 text-sm rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
            >
              Clear
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Wallet Connection Section */}
        <div className={`p-4 border-b ${borderClass}`}>
          {connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} className="text-green-500" />
                <div>
                  <p className="text-sm font-medium">Connected</p>
                  <p className="text-xs opacity-70">
                    {account?.address ? formatAddress(account.address) : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Wallet className="mx-auto mb-2 opacity-50" size={24} />
              <p className="text-sm opacity-70 mb-3">Connect wallet to deploy and store contracts</p>
              <button className={`px-4 py-2 rounded-lg border ${borderClass} hover:bg-gray-800 transition-colors`}>
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Deployed Contracts Section */}
        {deployedContracts.length > 0 && (
          <div className={`p-4 border-b ${borderClass}`}>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Database size={14} />
              Your Contracts ({deployedContracts.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {deployedContracts.map((contract) => (
                <div key={contract.address} className={`p-3 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{formatAddress(contract.address)}</span>
                    <div className="flex items-center gap-1">
                      <a 
                        href={contract.explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 p-1"
                        title="View on Explorer"
                      >
                        <ExternalLink size={12} />
                      </a>
                      {contract.storedOnChain && (
                        <div className="text-green-500 p-1" title="Stored on-chain">
                          <Database size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Private Key Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="opacity-70">Private Key:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePrivateKeyVisibility(contract.address)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title={showPrivateKeys[contract.address] ? "Hide" : "Show"}
                        >
                          {showPrivateKeys[contract.address] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(contract.privateKey)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Copy"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="font-mono text-xs p-2 bg-black/20 rounded break-all">
                      {showPrivateKeys[contract.address] 
                        ? contract.privateKey 
                        : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                    </div>
                    
                    {/* Store Key Button */}
                    {connected && !contract.storedOnChain && (
                      <button
                        onClick={() => storeKeyOnChain(contract.privateKey, contract.address)}
                        disabled={isStoringKey === contract.address}
                        className={`w-full py-1 px-2 text-xs rounded-lg border transition-colors ${
                          isStoringKey === contract.address
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                        }`}
                      >
                        {isStoringKey === contract.address ? "Storing..." : "Store Key On-Chain"}
                      </button>
                    )}
                    
                    {contract.storedOnChain && (
                      <div className="text-xs text-green-500 text-center">
                        ✓ Stored securely on-chain
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-scroll p-4 flex flex-col gap-4">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div
                  className={`p-3 rounded-lg max-w-[90%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white self-end"
                      : msg.sender === "system"
                        ? msg.isError
                          ? "bg-red-500 text-white self-center"
                          : "bg-green-500 text-white self-center"
                        : msg.isError
                          ? "bg-red-500 text-white self-start"
                          : `${isDark ? "bg-gray-700" : "bg-gray-200"} self-start`
                  }`}
                >
                  {msg.sender === "ai" && !msg.isError && (
                    <div className="flex items-center gap-1 mb-2 opacity-70">
                      <Bot size={12} />
                      <span className="text-xs">AI Assistant</span>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                  
                  {/* Deploy Button */}
                  {msg.showDeployButton && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <button
                        onClick={() => deployContract(idx)}
                        disabled={isDeploying}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          isDeploying
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {isDeploying ? (
                          <div className="flex items-center justify-center gap-2">
                            <Rocket size={16} className="animate-pulse" />
                            <span>Deploying...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Rocket size={16} />
                            <span>Deploy to Aptos Devnet</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Deployment Results */}
                  {msg.deploymentData && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-xs space-y-2">
                        <div>
                          <span className="opacity-70">Contract: </span>
                          <span className="font-mono">{formatAddress(msg.deploymentData.address)}</span>
                        </div>
                        
                        {connected && (
                          <button
                            onClick={() => storeKeyOnChain(msg.deploymentData.privateKey, msg.deploymentData.address)}
                            className="w-full py-1 px-2 text-xs rounded border-white/30 border hover:bg-white/10 transition-colors"
                          >
                            Store Private Key On-Chain
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <span className="text-xs opacity-50 px-1 self-start">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center mt-20">
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">AI Contract Studio</p>
              <p className="text-sm opacity-70 mb-4">Generate, deploy, and manage smart contracts</p>
              <div className="text-xs opacity-50 space-y-1">
                <p>Try: "Create a simple token contract"</p>
                <p>Or: "Build an NFT marketplace"</p>
              </div>
            </div>
          )}

          {(isProcessing || isDeploying) && (
            <div className="flex items-center gap-2 text-blue-500 text-sm">
              <Bot size={16} className="animate-pulse" />
              <span>{isDeploying ? "Deploying to blockchain..." : "AI is working..."}</span>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className={`p-4 border-t ${borderClass}`}>
          <div className="flex gap-2">
            <input
              type="text"
              className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${bgClass} ${textClass} ${borderClass}`}
              placeholder="Describe your smart contract..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={isProcessing || !inputMessage.trim()}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isProcessing || !inputMessage.trim()
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* iframe */}
      <iframe
        className="h-[100vh] w-[75vw]"
        src="http://localhost:8080/?folder=/home/coder/project"
        frameBorder="0"
      />
    </div>
  );
};

export default Page;