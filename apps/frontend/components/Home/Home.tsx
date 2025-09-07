"use client";
import React, { useState } from "react";
import { ArrowRight, Code, Zap, Shield, Sparkles, Brain, Users, DollarSign, TrendingUp } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background with radial gradient and glow effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-black to-black"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-t from-purple-500/20 to-transparent blur-3xl"></div>
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">MoveAI</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Blog
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contact Us
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Use
              </a>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Get This Template
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className="pt-20 pb-32">
            <div className="inline-block bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-blue-500/20">
              <span className="text-sm font-medium text-gray-300">
                Innovative Web3 Solutions
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">
                Revolutionizing smart contracts
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                with AI technology
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Experience the future of blockchain development with our innovative AI-powered Move contract generator.
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-black"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full border-2 border-black"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-black"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-black"></div>
              </div>
              <span className="text-gray-400 text-sm ml-4">Trusted already by 1.2k+</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-20">
              <button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
              <button className="bg-black/50 backdrop-blur-sm border border-gray-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-900/50 transition-all duration-200">
                Learn More
              </button>
            </div>

            {/* Central glowing orb effect */}
            <div className="relative mx-auto w-96 h-96 mb-20">
              <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-32 bg-gradient-to-b from-transparent via-white to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-32 bg-gradient-to-t from-purple-500/30 via-blue-500/20 to-transparent blur-xl"></div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-32">
            <div className="text-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-gray-800/50">
              <div className="text-sm text-gray-400 mb-2">Global User Base</div>
              <div className="text-4xl font-bold text-white mb-2">+2M</div>
              <div className="text-sm text-gray-500">2 Million+ Users</div>
            </div>

            <div className="text-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-gray-800/50">
              <div className="text-sm text-gray-400 mb-2">Transaction Volume</div>
              <div className="text-4xl font-bold text-white mb-2">+$1B</div>
              <div className="text-sm text-gray-500">Total Transaction Volume</div>
            </div>

            <div className="text-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-gray-800/50">
              <div className="text-sm text-gray-400 mb-2">High-Speed Processing</div>
              <div className="text-4xl font-bold text-white mb-2">99%</div>
              <div className="text-sm text-gray-500">Faster Transactions</div>
            </div>
          </div>

          {/* Main Input Section */}
          <div className="relative mb-32">
            <div className="text-center mb-16">
              <div className="text-sm text-gray-400 mb-4">Flexible and efficient</div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8">
                <span className="text-white">Simplifying Move Contract</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Generation for Everyone
                </span>
              </h2>
            </div>

            <div className="relative group max-w-4xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-8">
                <div className="flex flex-col space-y-6">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your smart contract vision... (e.g., 'Create a DeFi lending protocol with dynamic interest rates and collateral management')"
                    className="w-full h-32 bg-transparent text-white placeholder-gray-500 text-lg resize-none outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleGenerate();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Transform your ideas into production-ready Move contracts
                    </div>
                    <button
                      onClick={handleGenerate}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      disabled={!prompt.trim()}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
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

          {/* Example Prompts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-32 max-w-5xl mx-auto">
            {[
              "Create a DeFi staking pool with automatic compounding rewards",
              "Build an NFT marketplace with Dutch auction mechanisms",
              "Deploy a governance DAO with proposal and voting systems",
              "Generate a cross-chain bridge for asset transfers",
              "Design a yield farming protocol with multiple token rewards",
              "Create a decentralized exchange with automated market making"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left p-6 bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-xl border border-gray-800/30 hover:border-gray-700/50 transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Contract Template</span>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {example}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-gray-800/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2025 MoveAI. Powered by advanced AI and blockchain technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;