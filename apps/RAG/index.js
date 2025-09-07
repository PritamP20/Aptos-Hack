// index.mjs
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RetrievalQAChain } from "langchain/chains";

import dotenv from "dotenv";
dotenv.config();


// Dynamic import for FaissStore
const { FaissStore } = await import("@langchain/community/vectorstores/faiss");

async function main() {
  // Initialize LLM
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // Load PDF
  const loader = new PDFLoader("scraped_aptos.pdf");
  const docs = await loader.load();

  // Split text into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const documents = await splitter.splitDocuments(docs);

  // Create embeddings
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // Create vectorstore
  const vectorstore = await FaissStore.fromDocuments(documents, embeddings);

  // Create RetrievalQA chain
  const qa = RetrievalQAChain.fromLLM(llm, vectorstore.asRetriever(), {
    returnSourceDocuments: true,
  });

  // Example query
  const response = await qa.call({ query: "write me a hello world contract with move" });

  console.log("Answer:", response.text);
  console.log("Sources:", response.sourceDocuments);
}

main().catch(console.error);
