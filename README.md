# 🤖 Aptos AI Contract Crafter

**Aptos AI Contract Crafter** is an **AI-powered developer platform** that helps developers generate, edit, and deploy smart contracts on the **Aptos blockchain** with ease.

It converts natural language into **Move smart contracts**, deploys them securely through a **staking contract**, and ensures contracts are accessible only by their rightful owners via **signer hashing**.

The platform integrates a **Remix-like editor**, allowing developers to refine AI-generated code, request improvements, and re-deploy seamlessly. This solves the steep learning curve of blockchain languages and lowers the barrier to entry for new developers.

-----

## 📖 About the Project

  - 🌐 **Simplifies blockchain development** → No need to learn multiple blockchain languages.
  - 🤖 **AI-driven contract generation** → Fine-tuned Perplexity / Gemini with Aptos docs.
  - 🔒 **Secure deployment** → Contracts linked to users via signer hashing.
  - 🛠 **Dev-friendly editor** → AI-assisted contract improvements & error resolution.

-----

## 🛠 Tech Stack

  - **Blockchain:** Aptos, Move, Aptos SDKs
  - **Frontend:** Next.js, TailwindCSS
  - **AI/ML:** Perplexity / Gemini, LangChain, LangGraph (RAG pipeline)
  - **Infrastructure:** Docker, Turborepo

-----

## 📂 Project Structure

```
my-turborepo/
├── apps/
│ ├── Contract/ # My Custome Aptos Contract where i am Storing the credentials of the Contracts which the user deploy in devnet
│ ├── frontend/ # Main Next.js app (AI contract platform UI)
│ ├── GenAi/ # Gen Ai, Proper System prompted for creating a errorless smart contract
│ ├── Volume/ # local volume for Docker instance (AI contract platform UI)
│ └── RAG/ # RAG which is fined tuned with the aptos docs.
├── packages/
│ ├── ui/ # Shared React UI components
│ ├── eslint-config/ # Shared ESLint rules
│ ├── docker/ # Docker file for the vsCode instance
│ └── typescript-config/ # Shared TS configs
├── turbo.json # Turborepo config
└── package.json
```

-----

## 🚀 Features

  - 📝 AI-powered **smart contract generation & deployment**
  - 🔧 **Remix-like editor** for refining contracts
  - 🔒 **Secure signer-based ownership** with hashed storage
  - 📦 **Modular monorepo** with shared UI + configs
  - ⚡ **Optimized builds** with Turborepo caching

-----

## ⚙️ Getting Started

Clone the repo and install dependencies:

```sh
git clone https://github.com/PritamP20/Aptos-Hack.git
cd my-turborepo
npm install # or yarn install / pnpm install
```

Run the development server:

```sh
npx turbo dev
```

Build all apps and packages:

```sh
npx turbo build
```

-----

## 💡 Challenges & Learnings

### 1\. Bytecode & Module Deployment

Tried compiling and publishing Move modules similar to BSC, but Aptos SDK lacked full support.
Spent hours understanding bytecode flow, which gave deep insights despite failure.

### 2\. Signer-Based Deployment

Attempted deploying via a user’s browser wallet signer (mentor’s suggestion).
Faced integration challenges with permissions and automation, so couldn’t finalize.

### 3\. Secure Access via Hashing

Designed a staking contract to store deployed contract addresses securely.
Used a user’s signer hash to ensure only rightful access, preventing misuse.

### 4\. AI Hallucination & Fine-Tuning

Fine-tuned Perplexity/Gemini on Aptos docs but struggled with scraping and accuracy.
Solved hallucination issues by building a RAG pipeline for reliable contract generation.

-----

## 📌 Conclusion

While deployment presented multiple challenges, each failed attempt contributed to a deeper learning of the Aptos SDK, Move language, and AI integrations. The final working version ensures secure contract management, reliable AI outputs, and a developer-friendly interface.