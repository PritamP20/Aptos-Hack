"use client";
import React, { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  ArrowRight,
  Code,
  Zap,
  Shield,
  Sparkles,
  Brain,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Target,
  Cpu,
  Database,
  Award,
  ChevronRight,
  Play,
  Wallet,
  Menu,
  X,
  Clock,
  Eye,
  Download,
  Copy,
  ExternalLink,
  FileCode,
  Calendar,
  ChevronLeft,
} from "lucide-react";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userContracts, setUserContracts] = useState([]);
  const { connect, disconnect, connected, account } = useWallet();

  // Mock contract data - in a real app, this would come from your backend
  const mockContracts = [
    {
      id: "1",
      name: "DeFi Lending Protocol",
      type: "DeFi",
      date: "2025-01-15",
      status: "Deployed",
      network: "Mainnet",
      prompt:
        "Create a comprehensive DeFi lending protocol with multi-collateral support",
      contractAddress: "0x1234...5678",
      tvl: "$2.1M",
    },
    {
      id: "2",
      name: "NFT Marketplace",
      type: "NFT",
      date: "2025-01-10",
      status: "Testing",
      network: "Testnet",
      prompt: "Build an NFT marketplace with Dutch auction mechanisms",
      contractAddress: "0xabcd...efgh",
      tvl: "N/A",
    },
    {
      id: "3",
      name: "Governance DAO",
      type: "Governance",
      date: "2025-01-05",
      status: "Deployed",
      network: "Mainnet",
      prompt:
        "Deploy a governance DAO with proposal systems and treasury management",
      contractAddress: "0x9876...5432",
      tvl: "$850K",
    },
    {
      id: "4",
      name: "Staking Pool",
      type: "DeFi",
      date: "2024-12-28",
      status: "Deployed",
      network: "Mainnet",
      prompt: "Create a staking pool with automatic compounding rewards",
      contractAddress: "0xfedc...ba98",
      tvl: "$1.5M",
    },
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description:
        "Advanced machine learning algorithms analyze your requirements and generate optimized Move contracts with industry best practices.",
      details:
        "Our proprietary AI models have been trained on thousands of verified smart contracts and blockchain patterns.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security First",
      description:
        "Every generated contract undergoes automated security analysis, vulnerability scanning, and formal verification processes.",
      details:
        "Built-in protection against common vulnerabilities like reentrancy attacks, integer overflow, and access control issues.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Generate production-ready Move contracts in seconds, not days. Accelerate your development timeline by 10x.",
      details:
        "Average contract generation time: 2.3 seconds. Deploy to testnet in under 30 seconds.",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Production Ready",
      description:
        "Generated contracts are fully documented, tested, and ready for mainnet deployment with comprehensive documentation.",
      details:
        "Includes unit tests, integration tests, deployment scripts, and detailed technical documentation.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead Blockchain Developer",
      company: "DeFi Protocol Labs",
      content:
        "MoveAI reduced our smart contract development time by 80%. The generated code quality is exceptional.",
      avatar: "SC",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO",
      company: "Web3 Ventures",
      content:
        "The security analysis features caught vulnerabilities we would have missed. It's like having a senior auditor on our team.",
      avatar: "MR",
    },
    {
      name: "Emily Watson",
      role: "Blockchain Architect",
      company: "Enterprise Solutions Inc",
      content:
        "Professional-grade contracts with enterprise-level documentation. Perfect for our institutional clients.",
      avatar: "EW",
    },
  ];

  const useCases = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "DeFi Protocols",
      description:
        "Lending, borrowing, staking, and yield farming contracts with advanced tokenomics",
      examples: ["Automated Market Makers", "Liquidity Mining", "Flash Loans"],
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "NFT Platforms",
      description:
        "Complete NFT ecosystems with minting, trading, and marketplace functionality",
      examples: ["Dynamic NFTs", "Royalty Systems", "Auction Mechanisms"],
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "DAO Governance",
      description:
        "Decentralized governance systems with voting, proposals, and treasury management",
      examples: ["Multi-sig Wallets", "Proposal Systems", "Token Distribution"],
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Cross-chain Bridges",
      description:
        "Secure asset transfers between different blockchain networks",
      examples: ["Token Bridges", "Message Passing", "Liquidity Bridges"],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load user contracts when wallet is connected
  useEffect(() => {
    if (isWalletConnected) {
      setUserContracts(mockContracts);
    } else {
      setUserContracts([]);
    }
  }, [isWalletConnected]);

  const handleConnectWallet = async () => {
    // Mock wallet connection - replace with actual wallet connection logic
    try {
      connect("Petra");
      setIsWalletConnected(true);
      setWalletAddress("0x1234...5678");
      setIsSidebarOpen(true); // Auto-open sidebar when wallet connects
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
    setIsSidebarOpen(false);
    setUserContracts([]);
  };

  const handleGenerate = () => {
    if (prompt.trim()) {
      console.log("Generating contract for:", prompt);
      // Add your contract generation logic here
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Deployed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Testing":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Draft":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "DeFi":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "NFT":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "Governance":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-black to-black"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-purple-500/20 to-transparent blur-3xl"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-400/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Professional Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Contract History Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-xl border-l border-gray-800/50 transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Your Contracts
              </h3>
              <p className="text-sm text-gray-400">
                {isWalletConnected
                  ? `${userContracts.length} contracts found`
                  : "Connect wallet to view"}
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Wallet Status */}
          {isWalletConnected && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-green-400">
                    Wallet Connected
                  </p>
                  <p className="text-xs text-gray-400">{walletAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contract List */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {userContracts.length > 0 ? (
              userContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1">
                        {contract.name}
                      </h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(contract.type)}`}
                        >
                          {contract.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(contract.status)}`}
                        >
                          {contract.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>

                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(contract.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3 h-3" />
                      <span>{contract.network}</span>
                    </div>
                    {contract.tvl !== "N/A" && (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-3 h-3" />
                        <span>TVL: {contract.tvl}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-800">
                    <button className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded text-xs transition-colors">
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded text-xs transition-colors">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => setPrompt(contract.prompt)}
                      className="flex items-center space-x-1 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded text-xs transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Clone</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm mb-2">No contracts yet</p>
                <p className="text-gray-500 text-xs">
                  {isWalletConnected
                    ? "Generate your first smart contract to see it here"
                    : "Connect your wallet to view your contracts"}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-gray-800/50 mt-4">
            {isWalletConnected ? (
              <button
                onClick={handleDisconnectWallet}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Disconnect Wallet</span>
              </button>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Enhanced Header */}
      <header className="relative z-10 py-4 backdrop-blur-sm border-b border-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">MoveAI</span>
                <div className="text-xs text-gray-400">
                  Smart Contract Generator
                </div>
              </div>
            </div>
            <nav className="hidden lg:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#use-cases"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Use Cases
              </a>
              <a
                href="#pricing"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Documentation
              </a>
              <a
                href="#support"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Support
              </a>
              <div className="flex items-center space-x-3">
                {isWalletConnected ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">
                        {walletAddress}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2.5 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      {isSidebarOpen ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronLeft className="w-4 h-4" />
                      )}
                      {userContracts.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {userContracts.length}
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <button className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                      Sign In
                    </button>
                    <button
                      onClick={handleConnectWallet}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center space-x-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </button>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center space-x-3">
              {isWalletConnected && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                  {userContracts.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {userContracts.length}
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Enhanced Hero Section */}
        <section className="px-6 pt-16 pb-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-blue-500/20">
              <Award className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">
                Trusted by 500+ Web3 Companies
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="text-white">Professional</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Move Contracts
              </span>
              <br />
              <span className="text-white text-1xl md:text-2xl lg:text-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20">
                  <button
                    onClick={handleGenerate}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center space-x-2"
                  >
                    <a href="/contract">Start Building Now</a>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="bg-black/50 backdrop-blur-sm border border-gray-700 text-white px-10 py-4 rounded-full font-semibold hover:bg-gray-900/50 transition-all duration-200 flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Watch Demo</span>
                  </button>
                </div>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your blockchain ideas into production-ready Move smart
              contracts in seconds. Built for developers, audited by experts,
              trusted by enterprises.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  2.1k+ Active Developers
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
                <span className="text-gray-400 text-sm ml-2">
                  4.9/5 Developer Rating
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="px-6 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                <div className="text-sm text-gray-400 mb-2">
                  Contracts Generated
                </div>
                <div className="text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-sm text-gray-500">Production Ready</div>
              </div>
              <div className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                <div className="text-sm text-gray-400 mb-2">
                  Total Value Secured
                </div>
                <div className="text-4xl font-bold text-white mb-2">$2.5B+</div>
                <div className="text-sm text-gray-500">In Smart Contracts</div>
              </div>
              <div className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                <div className="text-sm text-gray-400 mb-2">Security Score</div>
                <div className="text-4xl font-bold text-white mb-2">99.8%</div>
                <div className="text-sm text-gray-500">
                  Vulnerability Detection
                </div>
              </div>
              <div className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                <div className="text-sm text-gray-400 mb-2">
                  Development Time
                </div>
                <div className="text-4xl font-bold text-white mb-2">10x</div>
                <div className="text-sm text-gray-500">Faster Development</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contract Generation Interface */}
        <section className="px-6 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-white">Generate Your</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Perfect Smart Contract
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Describe your vision in natural language and watch our AI
                transform it into production-ready Move code with comprehensive
                documentation and testing.
              </p>
            </div>

            <div className="relative group max-w-4xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl border border-gray-800/50 p-8">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-500 ml-4">
                      MoveAI Contract Generator
                    </span>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your smart contract requirements in detail...

Example: 'Create a comprehensive DeFi lending protocol with:
- Multi-collateral support (ETH, BTC, stablecoins)
- Dynamic interest rates based on utilization
- Flash loan functionality with 0.3% fee
- Liquidation mechanisms with bonus rewards
- Governance token integration for protocol decisions
- Emergency pause functionality for security'"
                    className="w-full h-48 bg-transparent text-white placeholder-gray-500 text-lg resize-none outline-none leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleGenerate();
                      }
                    }}
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Security Verified</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Gas Optimized</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Fully Documented</span>
                      </div>
                    </div>
                    <button
                      onClick={handleGenerate}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      disabled={!prompt.trim()}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Cpu className="w-4 h-4" />
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
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="px-6 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Enterprise-Grade Features
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Powerful tools and capabilities designed for professional
                blockchain development
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-8 bg-black/20 backdrop-blur-sm rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeFeature === index
                      ? "border-blue-500/50 bg-black/40"
                      : "border-gray-800/50 hover:border-gray-700/50"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <p className="text-sm text-gray-500">{feature.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="px-6 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Built for Every Use Case
              </h2>
              <p className="text-xl text-gray-400">
                From simple tokens to complex DeFi protocols
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      {useCase.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {useCase.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-4">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.examples.map((example, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-500/10 text-blue-300 text-sm rounded-full border border-blue-500/20"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-6 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Trusted by Industry Leaders
              </h2>
              <p className="text-xl text-gray-400">
                See what blockchain developers are saying about MoveAI
              </p>
            </div>

            <div className="relative">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <p className="text-xl text-gray-300 mb-6 leading-relaxed max-w-3xl mx-auto">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div>
                      <div className="text-white font-semibold">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {testimonials[currentTestimonial].role} at{" "}
                        {testimonials[currentTestimonial].company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentTestimonial === index
                        ? "bg-blue-500"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Example Prompts Grid */}
        <section className="px-6 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-white">
                Get Inspired
              </h2>
              <p className="text-xl text-gray-400">
                Try these popular contract templates
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "DeFi Staking Pool",
                  prompt:
                    "Create a DeFi staking pool with automatic compounding rewards, flexible lock periods, and early withdrawal penalties",
                  category: "DeFi",
                },
                {
                  title: "NFT Marketplace",
                  prompt:
                    "Build an NFT marketplace with Dutch auction mechanisms, royalty distribution, and collection management",
                  category: "NFT",
                },
                {
                  title: "DAO Governance",
                  prompt:
                    "Deploy a governance DAO with proposal systems, quadratic voting, and treasury management capabilities",
                  category: "Governance",
                },
                {
                  title: "Cross-chain Bridge",
                  prompt:
                    "Generate a cross-chain bridge for secure asset transfers with validator consensus and fraud proofs",
                  category: "Infrastructure",
                },
                {
                  title: "Yield Farming",
                  prompt:
                    "Design a yield farming protocol with multiple token rewards, LP incentives, and automated harvest functions",
                  category: "DeFi",
                },
                {
                  title: "DEX Protocol",
                  prompt:
                    "Create a decentralized exchange with automated market making, liquidity pools, and fee distribution",
                  category: "DeFi",
                },
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example.prompt)}
                  className="text-left p-6 bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-xl border border-gray-800/30 hover:border-gray-700/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-full border border-blue-500/20">
                      {example.category}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">
                    {example.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {example.prompt.substring(0, 100)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 mb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl border border-blue-500/20 p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Build the Future?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of developers who are already building with
                MoveAI
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-xl">
                  Start Your Free Trial
                </button>
                <button className="text-gray-400 hover:text-white transition-colors font-semibold">
                  Schedule a Demo →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-800/50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">MoveAI</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The future of smart contract development, powered by advanced AI
                technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                  <Globe className="w-4 h-4 text-gray-400" />
                </div>
                <div className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                  <Code className="w-4 h-4 text-gray-400" />
                </div>
                <div className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    API Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-500 text-sm">
                © 2025 MoveAI. All rights reserved. Powered by advanced AI and
                blockchain technology.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-xs text-gray-600">
                  Built with ❤️ for Web3 developers
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">
                    All systems operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
