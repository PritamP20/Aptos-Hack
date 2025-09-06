"use client";
import React, { useState } from "react";
import { ArrowRight, Code, Zap, Shield, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleGenerate = () => {
    if (prompt.trim()) {
      console.log("Generating contract for:", prompt);
      // Add your contract generation logic here
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SidebarTrigger className="text-white hover:text-gray-300" />
              <span className="text-xl font-bold">ContractAI</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Examples
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Docs
              </a>
              <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                AI-Powered Smart Contracts
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Build Aptos Contracts
              <br />
              <span className="text-4xl md:text-6xl">Without Code</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into secure, deployable Aptos smart contracts
              using simple prompts. No Move language knowledge required.
            </p>
          </div>

          {/* Main Input Section */}
          <div className="relative mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white via-gray-300 to-white rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-black/80 backdrop-blur-sm rounded-xl border border-white/20 p-8">
                <div className="flex flex-col space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Start writing contract... (e.g., 'Create a token swap contract with 0.3% fee' or 'Build an NFT marketplace with royalties')"
                    className="w-full h-32 bg-transparent text-white placeholder-gray-500 text-lg resize-none outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleGenerate();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Press Ctrl+Enter to generate</span>
                    </div>
                    <button
                      onClick={handleGenerate}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      disabled={!prompt.trim()}
                      className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                    >
                      <span>Generate Contract</span>
                      <ArrowRight
                        className={`w-4 h-4 transition-transform duration-200 ${isHovered ? "translate-x-1" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Generate production-ready contracts in seconds, not hours
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security First</h3>
              <p className="text-gray-400">
                Built-in security patterns and best practices
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Code Required</h3>
              <p className="text-gray-400">
                Plain English descriptions become smart contracts
              </p>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-semibold mb-6">Example Prompts</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              {[
                "Create a DeFi lending pool with variable interest rates",
                "Build an NFT collection with whitelist minting",
                "Deploy a governance token with voting mechanisms",
                "Generate a multi-signature wallet contract",
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                >
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    &ldquo;{example}&rdquo;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <p>&copy; 2025 ContractAI. Powered by AI.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
