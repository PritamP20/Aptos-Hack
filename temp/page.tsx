"use client";
import React, { useState } from "react";
import { Moon, Sun, Send, Bot, Wallet, User, LogOut } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { HexString } from "aptos";
// import Staking from "../../components/ByteCode/Staking"

interface Message {
  text: string;
  sender: string;
  timestamp: string;
  isError?: boolean;
}

const Page = () => {
  // Access fields / functions from the adapter
  const { account, connected, wallet, connect, disconnect, wallets: walletList } = useWallet();
  const wallets = walletList || []; 
  
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const bgClass = isDark ? "bg-black" : "bg-white";
  const textClass = isDark ? "text-white" : "text-black";
  const borderClass = isDark ? "border-gray-700" : "border-gray-300";
  const cardClass = isDark ? "bg-gray-900" : "bg-gray-50";

  // AI Response Function - Replace this with your actual AI integration
  const generateAIResponse = async (userMessage: string) => {
    const response = await fetch("http://localhost:3002/generate-full-suite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        prompt: userMessage,
        walletAddress: account?.address ? account.address.toString() : null // Convert to string safely
      }),
    });

    if (!response.ok) {
      console.error("API call failed:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("API response data:", data);
    return data.summary || data;
  };

  const handleWalletConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setShowWalletOptions(false);
      
      // Add a system message about wallet connection
      const connectionMessage = {
        text: `Wallet connected successfully! Address: ${account?.address || 'Loading...'}`,
        sender: "system",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, connectionMessage]);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      const errorMessage = {
        text: "Failed to connect wallet. Please try again.",
        sender: "system",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
      const disconnectionMessage = {
        text: "Wallet disconnected successfully.",
        sender: "system",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, disconnectionMessage]);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    // Add user message
    const userMessage = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      // Generate AI response
      const aiResponseText = await generateAIResponse(inputMessage);

      const aiMessage = {
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);

      const errorMessage = {
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
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
  if (!address) return "";
  const addrStr = typeof address === "string" ? address : address.toString();
  return `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}`;
};


  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={`flex ${bgClass} ${textClass} min-h-screen`}>
      {/* Chat Interface */}
      <div
        className={`w-1/4 ${cardClass} border-r ${borderClass} flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${borderClass} flex items-center justify-between`}
        >
          <h1 className="text-xl font-bold">AI Chat</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className={`px-3 py-1 text-sm rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
            >
              Clear
            </button>
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
              <button
                onClick={handleWalletDisconnect}
                className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800 text-red-400" : "hover:bg-gray-100 text-red-500"} transition-colors`}
                title="Disconnect Wallet"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
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
                      <p className="text-sm text-gray-500 p-2">No wallets detected</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-scroll p-4 flex flex-col gap-3">
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
                  {msg.sender === "system" && (
                    <div className="flex items-center gap-1 mb-1 opacity-70">
                      <Wallet size={12} />
                      <span className="text-xs">System</span>
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
        </div>

        {/* Input Box */}
        <div className={`p-4 border-t ${borderClass}`}>
          <div className="flex gap-2">
            <input
              type="text"
              className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${bgClass} ${textClass} ${borderClass}`}
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isProcessing && handleSend()
              }
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