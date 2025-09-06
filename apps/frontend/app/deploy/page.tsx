"use client";
import React, { useState } from "react";
import { Moon, Sun, Send, Bot } from "lucide-react";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

// Access fields / functions from the adapter
const { account, connected, wallet, changeNetwork } = useWallet();

interface Message {
  text: string;
  sender: string;
  timestamp: string;
  isError?: boolean;
}

const Page = () => {
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const bgClass = isDark ? "bg-black" : "bg-white";
  const textClass = isDark ? "text-white" : "text-black";
  const borderClass = isDark ? "border-gray-700" : "border-gray-300";
  const cardClass = isDark ? "bg-gray-900" : "bg-gray-50";

  // AI Response Function - Replace this with your actual AI integration
  const generateAIResponse = async (userMessage: string) => {
  const response = await fetch("http://localhost:3002/generate-full-suite", { // fixed URL
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: userMessage }),
  });

  if (!response.ok) {
    console.error("API call failed:", response.status, response.statusText);
    return null;
  }

  const data = await response.json();
  console.log("API response data:", data);
  return data.summary || data;
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

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-scroll p-4 flex flex-col gap-3">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white self-end rounded-br-sm"
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
                  className={`text-xs opacity-50 ${msg.sender === "user" ? "self-end" : "self-start"} px-1`}
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
              <p>Start a conversation by typing your message below</p>
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