# 🤖 Aptos AI Contract Crafter

![License](https://img.shields.io/badge/license-MIT-blue.svg) 
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg) 
![Aptos](https://img.shields.io/badge/Blockchain-Aptos-orange) 
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black) 
![AI](https://img.shields.io/badge/AI-Perplexity%20%7C%20Gemini-purple)

**Aptos AI Contract Crafter** is an **AI-powered developer platform** that helps developers generate, edit, and deploy smart contracts on the **Aptos blockchain** with ease.  
It converts natural language into **Move smart contracts**, deploys them securely through a **staking contract**, and ensures contracts are accessible only by their rightful owners via **signer hashing**.  

The platform integrates a **Remix-like editor**, allowing developers to refine AI-generated code, request improvements, and re-deploy seamlessly.  
This solves the steep learning curve of blockchain languages and lowers the barrier to entry for new developers.  

---

## 📖 About the Project

- 🌐 **Simplifies blockchain development** → No need to learn multiple blockchain languages.  
- 🤖 **AI-driven contract generation** → Fine-tuned Perplexity / Gemini with Aptos docs.  
- 🔒 **Secure deployment** → Contracts linked to users via signer hashing.  
- 🛠 **Dev-friendly editor** → AI-assisted contract improvements & error resolution.  

---

## 🛠 Tech Stack

- **Blockchain:** Aptos, Move, Aptos SDKs  
- **Frontend:** Next.js, TailwindCSS  
- **AI/ML:** Perplexity / Gemini, LangChain, LangGraph (RAG pipeline)  
- **Infrastructure:** Docker, Turborepo  

---

## 📂 Project Structure

my-turborepo/
├── apps/
│ ├── web/ # Main Next.js app (AI contract platform UI)
│ └── docs/ # Documentation site
├── packages/
│ ├── ui/ # Shared React UI components
│ ├── eslint-config/ # Shared ESLint rules
│ └── typescript-config/ # Shared TS configs
├── turbo.json # Turborepo config
└── package.json

yaml
Copy code

---

## 🚀 Features

- 📝 AI-powered **smart contract generation & deployment**  
- 🔧 **Remix-like editor** for refining contracts  
- 🔒 **Secure signer-based ownership** with hashed storage  
- 📦 **Modular monorepo** with shared UI + configs  
- ⚡ **Optimized builds** with Turborepo caching  

---

## ⚙️ Getting Started

Clone the repo and install dependencies:

```sh
git clone <your-repo-url>
cd my-turborepo
npm install # or yarn install / pnpm install
Run the development server:

sh
Copy code
npx turbo dev
Build all apps and packages:

sh
Copy code
npx turbo build
💡 Challenges & Learnings
1. Bytecode & Module Deployment

Tried compiling and publishing Move modules similar to BSC, but Aptos SDK lacked full support.

Spent hours understanding bytecode flow, which gave deep insights despite failure.

2. Signer-Based Deployment

Attempted deploying via user’s browser wallet signer (mentor’s suggestion).

Faced integration challenges with permissions and automation, so couldn’t finalize.

3. Secure Access via Hashing

Designed a staking contract to store deployed contract addresses securely.

Used user’s signer hash to ensure only rightful access, preventing misuse.

4. AI Hallucination & Fine-Tuning

Fine-tuned Perplexity/Gemini on Aptos docs but struggled with scraping and accuracy.

Solved hallucination issues by building a RAG pipeline for reliable contract generation.

📌 Conclusion
While deployment presented multiple challenges, each failed attempt contributed to deeper learning of Aptos SDK, Move language, and AI integrations.
The final working version ensures secure contract management, reliable AI outputs, and a developer-friendly interface.

