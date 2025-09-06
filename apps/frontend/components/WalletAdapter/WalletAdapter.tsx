"use client";

import * as React from "react";
import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.DEVNET,
        aptosApiKeys: {
          mainnet: process.env.APTOS_API_KEY_MAINNET,
        },
      }}
      onError={(error) => console.log("Wallet error", error)}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
